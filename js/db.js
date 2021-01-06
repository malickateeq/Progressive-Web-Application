
// Offline Data - Must declare above
db.enablePersistence()
.catch(err => {
    if(err.code == 'failed-precondition')
    {
        // Probably multiple tabs open at once
        console.log("persistence falied.");
    }
    else if(err.code == 'unimplemented')
    {
        // Browser does not support persistence DB
        console.log("Your browser does not support persistence DB.");
    }
});

// Real-time listener
// Will listen to any change in the DB and send the snapshot here
db.collection("menu").onSnapshot((snapshot) => {
    // console.log(snapshot.docChanges());
    console.log("Firebase changes...");
    snapshot.docChanges().forEach(change => 
        {
        // console.log(change, change.doc.data(), change.doc.id);

        if(change.type === "added")
        {
            // Add the document data to the webpage
            renderMenu(change.doc.data(), change.doc.id);
        }
        else if(change.type === "removed")
        {
            // Remove the document data from the webpage
        }
        else if(change.type === "modified")
        {
            // Update the document data to the webpage
        }
    });
});


// Add New Manu Item
const form = document.getElementById("add-menu");
form.addEventListener("submit", evt => {
    evt.preventDefault();
    
    const menu = {
        title: form.title.value,
        ingredients: form.ingredients.value,
        price: form.price.value,
    }

    console.log(menu);
    
    db.collection('menu').add(menu)
    .catch(err => {
        console.log(err);
    });

    form.title.value = "";
    form.ingredients.value = "";
    form.price.value = "";
});