import productTemplate from '../../../views/partials/product/infoAboutProduct.hbs';
import { bodyFixPosition } from '../../components/scroll/scroll';
import renderModal from '../../components/modal/modal';
import { preorderMark, setEventPreorder } from '../../layout/product/preorderModal';
import tryOnModelsModal from '../../../views/components/tryOnModelsModal.hbs';
import sizeChose from '../../components/sizeChose';
const { createBtn, onSizeElClick } = sizeChose;
import sizeChos from '../../../views/components/sizeTable.hbs';
import { onBtnClick } from '../../components/sizeTable';
import refs from '../../refs/refs.js';
// const newProductTemplate = productTemplate();
window.jQuery = window.$ = require('jquery');
require('../../slider/slick.min.js');
//* way to get a function from Andrew to render a size grid (don't clear)
// import sizeChose from '../fitting/sizeChose.js';
// const { createBtn } = sizeChose;

// have to clear string #12 after getting data from Local Storage (data from Ira Maksimova)
// localStorage.setItem('productInfoData', JSON.stringify(productInfo));
let savedProductInfoData = localStorage.getItem('productInfoData');
let parsedProductInfoData = JSON.parse(savedProductInfoData);
//! ---------------------------------------------------RENDERING A SECTION

export function setProductSlider() {
  $(document).ready(function () {
    $('.product-slider-smaller').not('.slick-initialized').slick({
      arrows: false,
      speed: 500,
      vertical: true,
      slidesToShow: 4,
      asNavFor: '.product-slider',
      focusOnSelect: true,
    });
    $('.product-slider').not('.slick-initialized').slick({
      arrows: false,
      dots: false,
      fade: true,
      speed: 500,
      slidesToShow: 1,
      lazyLoad: 'progressive',
      asNavFor: '.product-slider-smaller',
    });
    $('.product-slider-smaller').slick('setPosition');
  });
}

export function createFullMarkup() {
  savedProductInfoData = localStorage.getItem('productInfoData');
  parsedProductInfoData = JSON.parse(savedProductInfoData);

  // * ЗДЕСЬ ВМЕСТО productTEST нужно заливать правильный JSON***********
  return productTemplate({ productInfoData, btn });
}

//! ---------------------------------------------------Add to favorites
function checkIsProductInFavorites() {
  const addToFavoritesbuttonEl = document.querySelector('.product__name-wrapper .button-add-likes');
  const favoriteProduct = localStorage.getItem('favorites');
  const parsedFavoriteDate = JSON.parse(favoriteProduct);
  if (parsedFavoriteDate) {
    parsedFavoriteDate.fav.forEach(el => {
      if (el.id === parsedProductInfoData.id) {
        addToFavoritesbuttonEl.classList.add('active');
      }
    });
  }
}
function insertIntoLSFavorite(id) {
  let ls = JSON.parse(localStorage.getItem('favorites'));
  let newEl = true;
  if (ls) {
    ls.fav.forEach(el => {
      if (el.id === id) {
        newEl = false;
      }
    });
  } else {
    ls = { fav: [] };
  }
  if (newEl) {
    const isColorChose = localStorage.getItem('productColor');

    const elem = {
      id: parsedProductInfoData.id,
      name: parsedProductInfoData.name,
      image: {
        srcset: `${parsedProductInfoData.image[0].imageMobile} 1x, ${parsedProductInfoData.image[0].imageMobileHigherResolution} 2x`,
        'srcset-mobile': `${parsedProductInfoData.image[0].imageMobile} 1x, ${parsedProductInfoData.image[0].imageMobileHigherResolution} 2x`,
        src: parsedProductInfoData.image[0].imageMobile,
        alt: parsedProductInfoData.image[0].imageDescriprion,
      },
      price: parsedProductInfoData.productPrice,
      // have to get size from size grid from Andrew's function
      size: '46',
      description: '',
      color: isColorChose ? isColorChose : '',
    };

    ls.fav.push(elem);
    localStorage.setItem('favorites', JSON.stringify(ls));
    refs.favQuantityEl.innerHTML = ls.fav.length;
  }
}
function removeFromFavorite(id) {
  let ls = JSON.parse(localStorage.getItem('favorites'));
  const lsid = ls.fav.findIndex(el => el.id === id);
  ls.fav.splice(lsid, 1);
  localStorage.setItem('favorites', JSON.stringify(ls));
  refs.favQuantityEl.innerHTML = ls.fav.length;
}
function onAddToFavoritesClick(event) {
  const id = parsedProductInfoData.id;
  if (event.currentTarget.classList.contains('active')) {
    removeFromFavorite(id);
  } else {
    insertIntoLSFavorite(id);
  }
  event.currentTarget.classList.toggle('active');
}

//!----------------------------------------------------Colorpicker
function addCurrentClass(button) {
  button.classList.add('button__colorpicker--current');
}
function removeCurrentClass() {
  const currentClass = document.querySelector('.button__colorpicker--current');

  if (currentClass) {
    currentClass.classList.remove('button__colorpicker--current');
  }
}
function setProductColor(color) {
  localStorage.setItem('productColor', color);
}
function fixateCurrentClass(buttonArray, productColor) {
  for (let index = 0; index < buttonArray.length; index++) {
    const element = buttonArray[index];

    if (productColor === element.id) {
      addCurrentClass(element);
      break;
    }
  }
}
function onColorpickerListClick(event) {
  const colorpickerButton = event.target;
  const isColorpickerButton = colorpickerButton.classList.contains('button__colorpicker');

  if (!isColorpickerButton) {
    return;
  }

  const inputColor = event.target.previousElementSibling.value;

  productInfoData.productAviable.find(size => {
    if (size.colorId === inputColor) {
      availableSizes.push(size.aviableSize);
    }
  });

  removeCurrentClass();
  addCurrentClass(colorpickerButton);
  setProductColor(colorpickerButton.id);
}
function setProductDataToOrdering() {
  const orderingDataArray = localStorage.getItem('orderingData');
  const orderingDataParsed = JSON.parse(orderingDataArray);
  const elementId = orderingDataParsed.findIndex(element => {
    element.label.id === parsedProductInfoData.id;
  });
  if (elementId === -1) {
    let orderingDataobj = { label: {} };
    orderingDataobj.label.id = productInfoData.id;
    orderingDataobj.label.name = productInfoData.productName;
    orderingDataobj.label.img = productInfoData.image[0].imageMobile;
    orderingDataobj.label.price = productInfoData.productPrice;
    orderingDataobj.label.sizeSelected = localStorage.getItem('productSize');
    orderingDataobj.label.colorSelected = localStorage.getItem('productColor');
    orderingDataobj.label.circleSelected = '';
    orderingDataobj.label.description = '';
    orderingDataobj.label.count = 1;
    orderingDataobj.label.productAviable = productInfoData.productAviable;
    orderingDataParsed.push(orderingDataobj);
    localStorage.setItem('orderingData', JSON.stringify(orderingDataParsed));
  }
}

//!----------------------------------------------------Characteristic menu
function toggleIsOpenClass(menu) {
  menu.classList.toggle('is-open');
}
function transformPlusToMinus(button) {
  button.classList.toggle('button__minus');
}
function onCharacteristicsListClick(event) {
  const paramsMenuEl = document.querySelector('[data-params-menu]');
  const aditionalMenuEl = document.querySelector('[data-aditional-menu]');
  const buttonParamsEl = document.querySelector('.button__plus--params');
  const buttonAdditionalEl = document.querySelector('.button__plus--aditional');
  const isParams = event.target.classList.contains('button__plus--params');
  const isAditional = event.target.classList.contains('button__plus--aditional');

  if (isParams) {
    toggleIsOpenClass(paramsMenuEl);
    transformPlusToMinus(buttonParamsEl);
  } else if (isAditional) {
    toggleIsOpenClass(aditionalMenuEl);
    transformPlusToMinus(buttonAdditionalEl);
  }
}
//!----------------------------------------------------Determine Size
function onDetermineSizeButtonElClick() {
  // const preorderBackdropEl = document.querySelector('.preoder__backdrop');
  // preorderBackdropEl.classList.add('is-visible');
  renderModal(preorderMark, '');

  bodyFixPosition();
}
//!----------------------------------------------------Is size in a stock?
function onIsSizeInStockButtonElClick() {
  renderModal(sizeChos(), '');
}
//!----------------------------------------------------Fitting
function onFittingButtonElClick() {
  // const tryOnBackdropEl = document.querySelector('.try-on__backdrop');
  // tryOnBackdropEl.classList.add('is-visible');
  renderModal(tryOnModelsModal(), '');

  // bodyFixPosition();
}
//!----------------------------------------------------Fixate local storage data
function fixateDataFromLocalStorage() {
  const colorpickerButtonsEl = document.querySelectorAll('.button__colorpicker');
  let productColor = localStorage.getItem('productColor');

  fixateCurrentClass(colorpickerButtonsEl, productColor);
  checkIsProductInFavorites();
}

//!----------------------------------------------------LISTENERS
function createAllListeners(buy) {
  const characteristicListEl = document.querySelector('.product__characteristics');
  const colorpickerListEl = document.querySelector('.colorpicker__list');
  const purchaseBuyButtonEl = document.querySelector('.button__purchase--buy');
  const addToFavoritesButtonEl = document.querySelector('.product__name-wrapper .button-add-likes');
  const determineSizeButtonEl = document.querySelector('.button__size-option--available-size');
  const isSizeInStockButtonEl = document.querySelector('.button__size-option--find-size');
  const fittingButtonEl = document.querySelector('.button__purchase--fit');

  determineSizeButtonEl.addEventListener('click', onDetermineSizeButtonElClick);
  isSizeInStockButtonEl.addEventListener('click', onIsSizeInStockButtonElClick);
  addToFavoritesButtonEl.addEventListener('click', onAddToFavoritesClick);
  fittingButtonEl.addEventListener('click', onFittingButtonElClick);
  colorpickerListEl.addEventListener('click', onColorpickerListClick);
  characteristicListEl.addEventListener('click', onCharacteristicsListClick);
  purchaseBuyButtonEl.addEventListener('click', e => {
    e.preventDefault();
    buy(parsedProductInfoData.productName);
    console.log('object');
    setProductDataToOrdering();
  });
}

//!----------------------------------------------------EXPORT TO MAIN FILE
export function callProductPageFunctional(buy) {
  createAllListeners(buy);
  fixateDataFromLocalStorage();
}
