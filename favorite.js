// 完整的 Index API URL拆成兩段 處裡Show API 或圖片檔案時，能重覆使用BASE_URL
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
// 處理圖片檔案
const POSTER_URL = BASE_URL + '/posters/'

// 取得資料內容 for of 用法
// const movies = []

// axios.get(INDEX_URL).then((response) => {
// 	for (const movie of response.data.results) {
// 		movies.push(movie)
// 	}
// 	console.log(movies)
// }).catch((err) => console.log(err))

// 取得資料內容 展開運算子 用法
// ... 三個點點就是展開運算子，他的主要功用是「展開陣列元素」
// yow的翻譯 ... 就是破殼法。把陣列打開，一筆一筆列出來 

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")

//data - bs - toggle 我們指定接下來要使用 modal 的形式  
//data - bs - target 則定義了互動的目標元件是 #movie - modal
function moviesList(data) {
	let rowHtml = ""

	data.forEach((item) => {
		rowHtml += `
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
						<button class="btn btn-danger btn-remove-favorite" data-id="${item.id}"
						>
							X
						</button>
					</div>
				</div>
			</div>
		</div>`
	});

	dataPanel.innerHTML = rowHtml
}

function showMovieModal(id) {
	const modalTitle = document.querySelector('#movie-modal-title')
	const modalImage = document.querySelector('#movie-modal-image')
	const modalDate = document.querySelector('#movie-modal-date')
	const modalDescription = document.querySelector('#movie-modal-description')
	axios.get(INDEX_URL + id).then((response) => {
		const data = response.data.results
		modalTitle.innerText = data.title
		modalDate.innerText = 'Release date: ' + data.release_date
		modalDescription.innerText = data.description
		modalImage.innerHTML = `<img src="${POSTER_URL + data.image
			}" alt="movie-poster" class="img-fluid">`
	})
}

function removeFromFavorite (id){
	if(!movies || !movies.length) return

	//透過 id 找到要刪除電影的 index
	const movieIndex = movies.findIndex((movie) => movie.id === id)
	if (movieIndex === -1) return

	//刪除該筆電影
	movies.splice(movieIndex, 1)

	//存回 local storage
	localStorage.setItem('favoriteMovies', JSON.stringify(movies))

	//更新頁面
	moviesList(movies)

}


dataPanel.addEventListener("click", function onPanelClicked(event) {
	if (event.target.matches('.btn-show-movie')) {
		showMovieModal(Number(event.target.dataset.id))
	} else if (event.target.matches(".btn-remove-favorite")) {
		removeFromFavorite(Number(event.target.dataset.id))
	}
})

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
	//取消預設事件
	event.preventDefault()
	//取得搜尋關鍵字
	const keyword = searchInput.value.trim().toLowerCase()
	//儲存符合篩選條件的項目
	let filteredMovies = []
	//錯誤處理：輸入無效字串
	// if(!keyword.length){
	// 	return alert("請輸入有效字串!")
	// }
	//條件篩選

	// for (const movie of movies){
	// 	if (movie.title.toLowerCase().includes(keyword)){
	// 		filteredMovies.push(movie)
	// 	}		
	// }
	filteredMovies = movies.filter((movie) =>
		movie.title.toLowerCase().includes(keyword)
	)
	//錯誤處理：無符合條件的結果
	if (filteredMovies.length === 0) {
		return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
	}

	//重新輸出至畫面
	moviesList(filteredMovies)

})

moviesList(movies)