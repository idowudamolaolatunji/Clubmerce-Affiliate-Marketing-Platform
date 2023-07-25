i/*
const searchForm = document.querySelector('.nav__search');
const searchResults = document.getElementById('search-result')
console.log('i am connected')


searchForm.addEventListener('keyup', function(e) {
    e.preventDefault();
    const searchInput = document.querySelector('.nav__input');

    
    if(matchNotAccepted[0] === searchInput.value) {
        searchResults.innerHTML = '';
        return;
    }

    if(searchInput.value !== '') {
        fetch('/api/products/search-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({payload: searchInput.value}),
        }).then(res => res.json()).then(data => {
            const {payload} = data;
            console.log(payload);
            searchResults.innerHTML = '';
            let markup;

            
            if(searchInput.value === '' || searchInput.value === ' ') {
                searchResults.innerHTML = '';
                searchResults.style.backgroundColor = 'transparent';
                searchResults.style.boxShadow = 'none'
                return;
            }
            if(payload.length < 1) {
                searchResults.innerHTML = '<p>No result found</p>';
                searchResults.style.boxShadow = '0 1rem 4rem rgba(0, 0, 0, 0.15)'
                return;
            }
            payload.forEach((el, i) => {
                console.log(el)
                searchResults.innerHTML = '';
                markup += `<a href="/">${el.name}</a>`;
              
                searchResults.style.backgroundColor = '#fff'
                searchResults.style.boxShadow = '0 1rem 4rem rgba(0, 0, 0, 0.15)'
            })
            if(this.blur()) {
                searchResults.style.backgroundColor = 'transparent';
                searchResults.style.boxShadow = 'none'
            } 
              // Insert the markup into the searchResults div parent container
              searchResults.insertAdjacentHTML('beforeend', markup);

        }).catch(err => console.log(err));
    }
})
*/
const searchForm = document.querySelector('.nav__search');
const searchResults = document.getElementById('search-result');
console.log('I am connected');

searchForm.addEventListener('keyup', function (e) {
  e.preventDefault();
  const searchInput = document.querySelector('.nav__input');
  const searchTerm = searchInput.value.trim();

  if (searchTerm === '') {
    searchResults.innerHTML = '';
    searchResults.style.backgroundColor = 'transparent';
    searchResults.style.boxShadow = 'none';
    return;
  }

  fetch('/api/products/search-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: searchTerm }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      const { payload } = data;
      console.log(payload);
      let markup = '';

      if (payload.length === 0) {
        searchResults.innerHTML = '<p>No result found</p>';
        searchResults.style.backgroundColor = '#fff';
        searchResults.style.boxShadow = '0 1rem 4rem rgba(0, 0, 0, 0.15)';
        return;
      }

      payload.forEach((el) => {
        markup += `<a class='result' target="_blank" href='/marketplace/${el.slug}'>${el.name}</a>`;
      });

      // Clear previous results and insert the markup into the searchResults div parent container
      searchResults.classList.remove('hidden')
      searchResults.innerHTML = '';
      searchResults.insertAdjacentHTML('beforeend', markup);

      searchResults.style.backgroundColor = '#fff';
      searchResults.style.boxShadow = '0 1rem 4rem rgba(0, 0, 0, 0.15)';
      

      document.querySelector('.section__dashboard').addEventListener('click', function() {
        searchResults.classList.add('hidden')
      })
    })
    .catch((err) => console.error(err));
});


const categoryList = document.querySelector('.catergory__list');
const productBox = document.querySelector('.products__cards--box');
const spinOverlay = document.querySelector('#spinOverlay');

// Function to fetch products based on the selected category
const fetchProductsByCategory = async (category) => {
    try {
        // Show the spinner overlay
        // spinOverlay.style.visibility = "visible";
    
        const res = await fetch(`/api/products/niche/${category}`);
        if(!res.ok) return;

        const data = await res.json();
        console.log(data)
        const {products} = data.data;
        if(products.length === 0) {
            productBox.innerHTML = '<p>No product found..</p>';
            document.querySelector('.dashboard__subheading').textContent = category.split('-').join(' ');
            document.querySelector('.figures').textContent = `Total 0`;
            return;
        }

        // Clear the product container
        productBox.innerHTML = '';
    
        // Hide the spinner overlay
        // spinOverlay.style.visibility = 'hidden';
        document.querySelector('.dashboard__subheading').textContent = category.split('-').join(' ');
        document.querySelector('.figures').textContent = `Total ${products.length || 0}`;
        
        // Display the products for the selected category
        products.forEach(product => {
            console.log(product)
            const markup = `
                <div class="product__card ${product.isPromoted ? 'promoted' : ''}">
                    <div class="product__side--left">   
                        <div class="side--top">
                            <div class="product__image--container">
                                <img class="product__image" src="../../asset/img/product.jpg"/></div>
                            <div class="product__heading"> 
                                <h2 class="product__title">${product.name}</h2>
                                <p class="product__niche">${product.niche}</p>
                                <button class="produt__message person" data-vendorId=${product}>
                                    <i class="fa-solid fa-envelope icon product__icon></i>
                                </button>
                                <div class="product__content">
                                    <h4 class="product__description">${product.summary}...</h4>
                                </div>
                            </div>
                        </div>
                        <div class="side--bottom">
                            <ul class="product__info">
                                <li class="product__info--item"> <i class="fa-solid ${product.type === 'Digital' ? 'fa-file' : 'fa-truck-fast'} product__icon icon"></i>${product.type} Product</li>
                                <li class="product__info--item"> <i class="fa-solid fa-tools product__icon icon"></i>Affiliate tools</li>
                                <li class="product__info--item"> <i class="fa-solid fa-link product__icon icon"></i>Unique Link</li>
                                <li class="product__info--item"> <i class="fa-regular fa-square-check product__icon icon"></i>Approved</li>
                                ${product.recurringCommission ? '<li class="product__info--item"> <i class="fa-solid fa-rotate product__icon icon"></i>Recurring</li>' : ''}
                            </ul>
                        </div>
                    </div>
                    <div class="product__side--right">
                        <span class="product__commission">
                            <p class="commision">avg commission</p>
                            <span class="commission__amount">₦ ${product.price}</span>
                        </span>
                        <a class="btn product__button promote" data-productSlug="${product.slug}">Promote</a>
                        <a class="product__button page" target="_blank" href="/marketplace/${product.slug}">affiliate page</a>
                    </div>
                </div>
            `;
            productBox.insertAdjacentHTML('beforeend', markup);
        });
    } catch (error) {
        // Hide the spinner overlay
        // spinOverlay.style.visibility = "hidden";
    
        console.error('Error fetching products:', error);
        // Display an error message to the user
        productBox.innerHTML = '<p>Something went wrong, Try again</p>';
    }
};
  
  // Attach click event to each category item
if(categoryList) {
    categoryList.addEventListener('click', (event) => {
        const selectedCategory = event.target.dataset.item;
        console.log(selectedCategory)
        if (selectedCategory) {
        fetchProductsByCategory(selectedCategory);
        }
    });
}

const selectElement = document.querySelectorAll('.select__input');
// Function to fetch products based on the selected option
const fetchProducts = async (option) => {
  try {
    const res = await fetch(`/api/products/category/${option}`);
    if(!res.ok) return;
    const data = await res.json();
    
    const {products} = data.data;
    if(!products.length === 0) return;
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

let selectedOption;
// Function to display products in the product__container
const displayProducts = (products) => {
    console.log(products)
    // Clear previous products
    productBox.innerHTML = '';
    
    // Display each product in the product__container
    document.querySelector('.figures').textContent = `Total ${products.length || 0}`
    document.querySelector('.dashboard__subheading').textContent = selectedOption.split('-').join(' ')

    products.forEach((product) => {
        const markup = `
            <div class="product__card ${product.isPromoted ? 'promoted' : ''}">
                <div class="product__side--left">   
                    <div class="side--top">
                        <div class="product__image--container">
                            <img class="product__image" src="../../asset/img/${product.image}.jpg"/></div>
                        <div class="product__heading"> 
                            <h2 class="product__title">${product.name}</h2>
                            <p class="product__niche">${product.niche}</p>
                            <button class="produt__message person" data-vendorId=${product}>
                                <i class="fa-solid fa-envelope icon product__icon></i>
                            </button>
                            <div class="product__content">
                                <h4 class="product__description">${product.summary}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="side--bottom">
                        <ul class="product__info">
                            <li class="product__info--item"> <i class="fa-solid ${product.type === 'Digital' ? 'fa-file' : 'fa-truck-fast'} product__icon icon"></i>${product.type} Product</li>
                            <li class="product__info--item"> <i class="fa-solid fa-tools product__icon icon"></i>Affiliate tools</li>
                            <li class="product__info--item"> <i class="fa-solid fa-link product__icon icon"></i>Unique Link</li>
                            <li class="product__info--item"> <i class="fa-regular fa-square-check product__icon icon"></i>Approved</li>
                            ${product.recurringCommission ? '<li class="product__info--item"> <i class="fa-solid fa-rotate product__icon icon"></i>Recurring</li>' : ''}
                        </ul>
                    </div>
                </div>
                <div class="product__side--right">
                    <span class="product__commission">
                        <p class="commision">avg commission</p>
                        <span class="commission__amount">₦ ${product.price}</span>
                    </span>
                    <a class="btn product__button promote" data-productSlug="${product.slug}">Promote</a>
                    <a class="product__button page" target="_blank" href="/marketplace/${product.slug}">affiliate page</a>
                </div>
            </div>
        `;
        productBox.insertAdjacentHTML('beforeend', markup);
    });
};

// Event listener for the select element
if(selectElement) {
    selectElement.forEach(el => el.addEventListener('change', async(event) => {
        selectedOption = event.target.value;
        console.log(selectedOption, 'i was clicked..')
        const products = await fetchProducts(selectedOption);
        displayProducts(products);
    }));
}