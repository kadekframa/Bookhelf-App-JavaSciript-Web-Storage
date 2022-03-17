
// Inisialisasi variable untuk menampung elemen dokumen yang akan digunakan.
const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function(){       // DOMContenLoaded merupakan event HTML yang dipanggil ketika dokumen HTML telah selesai load dan parsing tanpa menunggu stylesheets atau css, images atau frames selesai di proses.
    const submitFormInputBook = document.getElementById("inputBook");
    submitFormInputBook.addEventListener("submit", function(){
        event.preventDefault();
        addBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

function addBook(){
    const bookTitle = document.getElementById("inputBookTitle").value;
    const bookAuthor = document.getElementById("inputBookAuthor").value;
    const bookYear = document.getElementById("inputBookYear").value;

    function bookStatus(){
        let bacaStatus;
        const bookStatus = document.getElementById("inputBookIsComplete");
        if(bookStatus.checked){
            bacaStatus = true;
        }else{
            bacaStatus = false;
        }
        return bacaStatus;
    }

    
    const generateID = generateId();
    const bookObject = generateBookObject(generateID, bookTitle, bookAuthor, bookYear, bookStatus());
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId(){
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete){
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}


document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    incompleteBookshelfList.innerHTML = "";

    const completeBookshelfList = document.getElementById("completeBookshelfList");
    completeBookshelfList.innerHTML = "";

    for (let bookItem of books) {
        const bookElement = makeBook(bookItem);

        if(bookItem.isComplete == false){
            incompleteBookshelfList.append(bookElement);
        }else{
            completeBookshelfList.append(bookElement);
        }
        
    }
});

function makeBook(bookObject){
    const bookTitle = document.createElement("h3");
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = bookObject.author;

    const bookYear = document.createElement("p");
    bookYear.innerText = bookObject.year;

    const constainerInner = document.createElement("div")
    constainerInner.classList.add("action");


    if(bookObject.isComplete){
        const undoButton = document.createElement("button");
        undoButton.innerText = "Belum selesai dibaca";
        undoButton.classList.add("green");
        undoButton.addEventListener("click", function(){
            addTaskToIncompleted(bookObject.id);
        });

        const removeButtton = document.createElement("button");
        removeButtton.innerText = "Hapus buku";
        removeButtton.classList.add("red");
        removeButtton.addEventListener("click", function(){
           removeTaskFromCompleted(bookObject.id);
        });

        constainerInner.append(undoButton, removeButtton);

    }else{
        const doneButton = document.createElement("button");
        doneButton.innerText = "Selesai dibaca";
        doneButton.classList.add("green");
        doneButton.addEventListener("click", function(){
            addTaskToCompleted(bookObject.id);
        });

        const removeButtton = document.createElement("button");
        removeButtton.innerText = "Hapus buku";
        removeButtton.classList.add("red");
        removeButtton.addEventListener("click", function(){
           removeTaskFromCompleted(bookObject.id);
        });

        constainerInner.append(doneButton, removeButtton);
    }

    
    const articleContainer = document.createElement("article");
    articleContainer.classList.add("book_item");
    articleContainer.append(bookTitle, bookAuthor, bookYear, constainerInner);
    articleContainer.setAttribute("id", `todo-${bookObject.id}`);

    return articleContainer;
}


function addTaskToCompleted(bookId){
    const bookTarget = findBook(bookId);
    if(bookTarget == null){
        return;
    }

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId){
    for (bookItem of books) {
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}


function addTaskToIncompleted(bookId){
    const bookTarget = findBook(bookId);
    if(bookTarget == null){
        return;
    }

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTaskFromCompleted(bookId){
    const bookTarget = findBookIndex(bookId);
    if(bookTarget === -120) return;
    books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    // Custom Dialog Script.
    const customDialog = document.getElementById("modal-container");
    const okeButton = document.getElementById("ok");
    customDialog.classList.add("show");

    okeButton.addEventListener("click", function(){
        customDialog.classList.remove("show");
    });

}

function findBookIndex(bookId){
    for (index in books) {
        if(books[index].id === bookId){
            return index;
        }
    }
    return -120;
}


function customDialog(){
    const successDelete = document.createElement("h1");
    successDelete.innerText = "Success";

    const keteranganSuccess = document.createElement("p");
    keteranganSuccess.innerText = "Data Buku Berhasil Dihapus!";

    const dialogButton = document.createElement("button")
    dialogButton.innerText = "OK";

    const innerContainer = document.createElement("div");
    innerContainer.append(successDelete, keteranganSuccess, okeButton);
    innerContainer.classList.add("modal");

    const modalContainer = document.createElement("div");
    modalContainer.append(innerContainer);
    modalContainer.classList.add("modal-container");
    modalContainer.setAttribute("id", "modal-container");

    return modalContainer;
}


function saveData(){
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

const STORAGE_KEY = "BOOKSHELF_APP";
const SAVED_EVENT = "saved-book";

function isStorageExist(){
    if(typeof(Storage) === "undefined"){
        alert("Browser Anda Belum Mendukung Fitur WebStorage");
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function(){
    console.info(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage(){
    serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null){
        for (book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}