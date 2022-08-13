// 完整的 Index API URL拆成兩段 處裡Show API 或圖片檔案時，能重覆使用BASE_URL
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
// 處理圖片檔案
const POSTER_URL = BASE_URL + "/posters/";
// 每頁只顯示 12 筆資料
const MOVIES_PER_PAGE = 12;

const movies = [];
//儲存符合篩選條件的項目
let filteredMovies = [];
// 宣告currentPage去紀錄目前分頁，確保切換模式時分頁不會跑掉且搜尋時不會顯示錯誤
let currentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modeChange = document.querySelector("#change-mode");

//data - bs - toggle 我們指定接下來要使用 modal 的形式
//data - bs - target 則定義了互動的目標元件是 #movie - modal
function moviesList(data) {
	if (dataPanel.dataset.mode === "card-mode") {
		let rawHtml = "";

		data.forEach((item) => {
			rawHtml += `
		<div class="col-sm-3">
			<div class="mb-2">
				<div class="card">
					<img src="${POSTER_URL + item.image}"
						class="card-img-top" alt="Movie Poster" />
					<div class="card-body">
						<h5 class="card-title">${item.title}</h5>
					</div>
					<div class="card-footer">
						<button class="btn btn-primary btn-show-movie"
						data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}"
						>
							More
						</button>
						<button class="btn btn-info btn-add-favorite" data-id="${item.id}"
						>
							+
						</button>
					</div>
				</div>
			</div>
		</div>`;
		});

		dataPanel.innerHTML = rawHtml;
	} else if (dataPanel.dataset.mode === "list-mode") {
		let rawHTML = `<ul class="list-group col-sm-12 mb-2">`;
		data.forEach((item) => {
			rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
         <button class="btn btn-primary btn-show-movie"
						data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}"
						>
							More
						</button>
						<button class="btn btn-info btn-add-favorite" data-id="${item.id}"
						>
							+
						</button>
        </div>
      </li>`;
		});
		rawHTML += "</ul>";
		dataPanel.innerHTML = rawHTML;
	}
}

// 製作底部分頁按鈕數量 函式
function renderPaginator(amount) {
	//計算總頁數
	const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
	//製作 template
	let rawHTML = "";

	for (let page = 1; page <= numberOfPages; page++) {
		rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
	}
	//放回 HTML
	paginator.innerHTML = rawHTML;
}

// 分割畫面內容 函式
function getMoviesByPage(page) {
	// 如果搜尋清單有東西，就取搜尋清單 filteredMovies，否則就還是取總清單 movies
	const data = filteredMovies.length ? filteredMovies : movies;
	//計算起始 index
	const startIndex = (page - 1) * MOVIES_PER_PAGE;
	//回傳切割後的新陣列
	return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 按鈕More的電影詳細內容 函式
function showMovieModal(id) {
	const modalTitle = document.querySelector("#movie-modal-title");
	const modalImage = document.querySelector("#movie-modal-image");
	const modalDate = document.querySelector("#movie-modal-date");
	const modalDescription = document.querySelector("#movie-modal-description");
	axios.get(INDEX_URL + id).then((response) => {
		const data = response.data.results;
		modalTitle.innerText = data.title;
		modalDate.innerText = "Release date: " + data.release_date;
		modalDescription.innerText = data.description;
		modalImage.innerHTML = `<img src="${POSTER_URL + data.image
			}" alt="movie-poster" class="img-fluid">`;
	});
}

// 按鈕 + 加入到最愛 函式
function addToFavorite(id) {
	console.log(id);
	const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
	const movie = movies.find((movie) => movie.id === id);
	if (list.some((movie) => movie.id === id)) {
		return alert("此電影已經在收藏清單中");
	}
	list.push(movie);
	localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 切換顯示模式
function changeAnotherMode(displayMode) {
	if (dataPanel.dataset.mode === displayMode) return;
	dataPanel.dataset.mode = displayMode;
}

// 切換監聽器
modeChange.addEventListener("click", function onClicked(event) {
	if (event.target.matches("#card-mode-button")) {
		changeAnotherMode("card-mode");
		moviesList(getMoviesByPage(currentPage));
	} else if (event.target.matches("#list-mode-button")) {
		changeAnotherMode("list-mode");
		moviesList(getMoviesByPage(currentPage));
	}
});

// 詳細內容 More 和 加到最愛 + 的監聽器
dataPanel.addEventListener("click", function onPanelClicked(event) {
	if (event.target.matches(".btn-show-movie")) {
		showMovieModal(Number(event.target.dataset.id));
	} else if (event.target.matches(".btn-add-favorite")) {
		addToFavorite(Number(event.target.dataset.id));
	}
});

// 搜尋監聽器
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
	//取消預設事件
	event.preventDefault();
	//取得搜尋關鍵字
	const keyword = searchInput.value.trim().toLowerCase();

	filteredMovies = movies.filter((movie) =>
		movie.title.toLowerCase().includes(keyword)
	);
	//錯誤處理：無符合條件的結果
	if (filteredMovies.length === 0) {
		return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
	}
	currentPage = 1;

	//重製分頁器
	renderPaginator(filteredMovies.length);
	//預設顯示第 1 頁的搜尋結果
	moviesList(getMoviesByPage(currentPage));
});

// 底部分頁按鈕監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
	//如果被點擊的不是 a 標籤，結束
	if (event.target.tagName !== "A") return;

	//透過 dataset 取得被點擊的頁數
	const page = Number(event.target.dataset.page);
	currentPage = page;

	//更新畫面
	moviesList(getMoviesByPage(currentPage));
});

axios
	.get(INDEX_URL)
	.then((response) => {
		movies.push(...response.data.results);
		renderPaginator(movies.length);
		moviesList(getMoviesByPage(currentPage));
	})
	.catch((err) => console.log(err));
