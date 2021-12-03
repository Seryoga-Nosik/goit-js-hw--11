import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { refs } from './refs';
import { fetchImages } from './fetchImages';
import { imagesListMarkup } from './renderMarkup';

const { searchForm, gallery, loadMoreBtn } = refs;

loadMoreBtn.classList.add('is-hidden');

searchForm.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onloadMoreBtnClick);

let searchData = null;
let page = 1;
let totalImages = 0;
const pageSize = 40;
let totalPages = 0;

function onFormSubmit(e) {
  e.preventDefault();

  searchData = e.target.searchQuery.value;

  if (searchData.trim() === '') {
    Notify.info('Please, enter your query.');
    return;
  }
  fetchImages(searchData, page, pageSize)
    .then(data => {
      if (data.hits.length === 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        loadMoreBtn.classList.add('is-hidden');
        resetMarkup();
        return;
      }
      resetMarkup();
      renderMarkup(data);
      totalImages = data.totalHits;
      page += 1;
      totalPages = Math.ceil(totalImages / pageSize);
      loadMoreBtn.classList.remove('is-hidden');
    })
    .catch(console.log); // ? Очень большие сомнения по поводу этого catch. Не могу понять до конца, работает ли он правильно и нужен ли он тут вообще.🤷🏻‍♂️🤔
}

function onloadMoreBtnClick() {
  fetchImages(searchData, page, pageSize)
    .then(data => {
      imagesListMarkup(data.hits);
      page += 1;
      if (page > totalPages) {
        loadMoreBtn.classList.add('is-hidden');
        Notify.info("We're sorry, but you've reached the end of search results.");
      }
    })
    .catch(console.log);
}

function resetMarkup() {
  gallery.innerHTML = '';
}

function renderMarkup(images) {
  imagesListMarkup(images.hits);
  Notify.success(`Hooray! We found ${images.totalHits} images.`);
  new SimpleLightbox('.gallery a', { spinner: true }).refresh();
}
