
const menu = document.querySelector(".menu");

// Render Menu to Frontend
const renderMenu = (data, id) =>{

    const html = `
        <div class="col-md-4 menues" data-id="${id}">
            <div class="card shadow-sm">
                <img src="img/food.png" alt="" class="bd-placeholder-img card-img-top" width="100%" height="225">
                <div class="card-body">
                <h4>${data.title}</h4>
                <br>
                <p class="card-text"> ${data.ingredients} </p>
                <br>
                <p class="card-text"> <b> ${data.price} USD <b> </p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-id="${id}">Delete</button>
                    </div>
                    <small class="text-muted">9 mins</small>
                </div>
                </div>
            </div>
        </div>
    `;

    menu.innerHTML += html;
}

// Remove recipe from DOM
const removeRecipe = (id) => {
    const menu = document.querySelector(`.menues[data-id=${id}]`);
    console.log(menu);
    menu.remove();
};

{/* <button type="button" class="btn btn-sm btn-outline-secondary" data-id="${id}">View</button> */}