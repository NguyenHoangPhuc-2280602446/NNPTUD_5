const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let currentPage = 1;
let pageSize = 10;
let sortField = "";
let sortAsc = true;
let selectedId = null;

async function loadData() {
  const res = await fetch(API);
  products = await res.json();
  render();
}

function render() {
  let data = [...products];

  const search = searchInput.value.toLowerCase();
  data = data.filter(x => x.title.toLowerCase().includes(search));

  if (sortField) {
    data.sort((a,b)=>{
      return sortAsc ? a[sortField]-b[sortField] : b[sortField]-a[sortField];
    });
  }

  const start = (currentPage-1)*pageSize;
  const pageData = data.slice(start, start+pageSize);

  tableBody.innerHTML = "";
  pageData.forEach(p=>{
    const tr = document.createElement("tr");
    tr.title = p.description;
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>${p.price}</td>
      <td>${p.category?.name}</td>
      <td><img src="${p.images[0]}" width="50"></td>
    `;
    tr.onclick = ()=>openDetail(p);
    tableBody.appendChild(tr);
  });

  renderPagination(data.length);
}

function renderPagination(total){
  const pages = Math.ceil(total/pageSize);
  pagination.innerHTML="";
  for(let i=1;i<=pages;i++){
    const btn = document.createElement("button");
    btn.className="btn btn-sm btn-secondary m-1";
    btn.innerText=i;
    btn.onclick=()=>{currentPage=i;render()};
    pagination.appendChild(btn);
  }
}

function openDetail(p){
  selectedId=p.id;
  editTitle.value=p.title;
  editPrice.value=p.price;
  editDesc.value=p.description;
  new bootstrap.Modal(detailModal).show();
}

saveBtn.onclick = async () => {
  const idx = products.findIndex(p => p.id === selectedId);

  if (idx === -1) return;

  products[idx].title = editTitle.value;
  products[idx].price = Number(editPrice.value);
  products[idx].description = editDesc.value;

  // call API (optional, demo)
  try {
    await fetch(`${API}/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.value,
        price: Number(editPrice.value),
        description: editDesc.value
      })
    });
  } catch (e) {
    console.log("API update blocked, using local update");
  }

  bootstrap.Modal.getInstance(detailModal).hide();
  render();
};

createBtn.onclick = () => {
  if (!newTitle.value || !newPrice.value) {
    alert("Please enter title and price");
    return;
  }

  const item = {
    id: Date.now(),
    title: newTitle.value,
    price: Number(newPrice.value),
    description: newDesc.value,
    category: { name: "Clothes" },
    images: ["https://picsum.photos/300"]
  };

  // thêm lên đầu mảng
  products.unshift(item);

  // reset form
  newTitle.value = "";
  newPrice.value = "";
  newDesc.value = "";

  // đóng modal
  bootstrap.Modal.getInstance(createModal).hide();

  // quay về trang 1
  currentPage = 1;
  render();
};

exportBtn.onclick=()=>{
  let csv="id,title,price\n";
  products.forEach(p=>{
    csv+=`${p.id},${p.title},${p.price}\n`;
  });
  const blob=new Blob([csv]);
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="products.csv";
  a.click();
}

sortTitle.onclick=()=>{sortField="title";sortAsc=!sortAsc;render();}
sortPrice.onclick=()=>{sortField="price";sortAsc=!sortAsc;render();}

pageSize.onchange=()=>{pageSize=+pageSize.value;render();}
searchInput.oninput=()=>render();

loadData();