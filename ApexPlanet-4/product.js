const products = [
  {
    id: 1,
    name: "Smartphone",
    category: "electronics",
    price: 9999,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    name: "Wireless Headphones",
    category: "electronics",
    price: 3499,
    rating: 4.2,
    image: "https://m.media-amazon.com/images/I/512sO2L0k6L.jpg"
  },
  {
    id: 3,
    name: "Men's T-Shirt",
    category: "clothing",
    price: 799,
    rating: 4.0,
    image: "https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465185/item/goods_71_465185_3x4.jpg?width=423"
  },
  {
    id: 4,
    name: "Running Shoes",
    category: "clothing",
    price: 1999,
    rating: 4.3,
    image: "https://img.tatacliq.com/images/i22//437Wx649H/MP000000025556099_437Wx649H_202503030411581.jpeg"
  },
  {
    id: 5,
    name: "Wrist Watch",
    category: "accessories",
    price: 2599,
    rating: 4.6,
    image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSe1VP4w6RPNsvCGPVP5fD_a8R_hP9XtV2jebimBrVdWsAwUL7iroJBns3-FKEgXeNp0Zighw2J1CzYKJujyw1D0q6EXBXp1At3SkDEGsF6tmYKrRWx-Z9o"
  },
  {
    id: 6,
    name: "Backpack",
    category: "accessories",
    price: 1299,
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 7,
    name: "Science Fiction Book",
    category: "books",
    price: 499,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 8,
    name: "Notebook Set",
    category: "books",
    price: 299,
    rating: 4.1,
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTkdfPc53Uo3BOnexoT5_xj9dA7Ti6xutABV1VwjK08CL-lpM1jMtY9SaFJohUfQRwFLhA6uVwOXnwTU5Q3OoMMkJiTDYzOpb3glP-5hw5A57iiumwnTRoYZA"
  },
  {
    id: 9,
    name: "Toy-House",
    category: "kids",
    price: 2799,
    rating: 3.1,
    image: "https://m.media-amazon.com/images/I/511f59AVfDL._SX300_SY300_QL70_FMwebp_.jpg"
  },
  {
    id: 10,
    name: "Toy-Car",
    category: "kids",
    price: 399,
    rating: 4.1,
    image: "https://m.media-amazon.com/images/I/51h3UE8RH0L._SX300_SY300_QL70_FMwebp_.jpg"
  },
  {
    id: 11,
    name: "Jeans",
    category: "clothing",
    price: 1199,
    rating: 4.5,
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRAm1ACSBdJHfPt6nCyL7pSQkyYACe0BwLTRp36_oS4e9KLR5S3RAa8xsIq0kBB0oC_6SSc_gnrz0xAx9fpJt3BS67OQw3CnsCARUwU1cB5EiZyjA_VRNFx"
  },
  {
    id: 12,
    name: "laptop",
    category: "electronics",
    price: 299,
    rating: 4.1,
    image: "https://p4-ofp.static.pub//fes/cms/2024/03/27/7p53rmw90imz3bm3yaospkfkh1t274701933.png"
  },
];


let cartCount = 0;

const productList = document.getElementById("productList");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const sortBy = document.getElementById("sortBy");
const cartCountDisplay = document.getElementById("cartCount");

function createProductCard(product) {
  const card = document.createElement("div");
  card.classList.add("product");
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <h3>${product.name}</h3>
    <p class="category">${product.category}</p>
    <p class="price">₹${product.price}</p>
    <p class="rating">⭐ ${product.rating}</p>
    <button onclick="addToCart()">Add to Cart</button>
  `;
  card.onclick = () => showModal(product);
  return card;
}

function renderProducts(data) {
  productList.innerHTML = "";
  data.forEach(product => {
    const card = createProductCard(product);
    productList.appendChild(card);
  });
}

function filterAndSortProducts() {
  let filtered = [...products];

  const category = categoryFilter.value;
  const priceRange = priceFilter.value;
  const sort = sortBy.value;

  if (category !== "all") {
    filtered = filtered.filter(p => p.category === category);
  }

  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(Number);
    filtered = filtered.filter(p => p.price >= min && p.price <= max);
  }

  if (sort === "priceLowHigh") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "priceHighLow") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "ratingHighLow") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  renderProducts(filtered);
}

categoryFilter.onchange = filterAndSortProducts;
priceFilter.onchange = filterAndSortProducts;
sortBy.onchange = filterAndSortProducts;

function addToCart() {
  cartCount++;
  cartCountDisplay.innerText = cartCount;
  showToast("Added to cart!");
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function showModal(product) {
  const modal = document.getElementById("productModal");
  const content = document.getElementById("modalContent");
  content.innerHTML = `
    <span class="closeBtn" onclick="closeModal()">×</span>
    <img src="${product.image}" style="width: 100%; height: auto;" />
    <h2>${product.name}</h2>
    <p><strong>Category:</strong> ${product.category}</p>
    <p><strong>Price:</strong> ₹${product.price}</p>
    <p><strong>Rating:</strong> ⭐${product.rating}</p>
  `;
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

window.onload = () => renderProducts(products);
