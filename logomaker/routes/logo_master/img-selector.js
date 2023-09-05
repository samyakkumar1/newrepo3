const fs = require("fs");

const getRecommendedImageURL = (industry) => {
  const logos = JSON.parse(fs.readFileSync('./public/img-label/select-style.json'));
  url_list = [];

  /*for (var i = 0; i < logos.length; i++) {
    if (logos[i].Industry.includes(industry)){
    url_list.push(logos[i].pimg);
    }
  }*/

  index_arr = [-1];
  for (var i = 0; i < 5; ++i) {
    select_index = randomNumber(0,logos.length);
    if(index_arr.includes(select_index)==false){
      index_arr.push(select_index);
      url_list.push(logos[select_index].pimg);
    }
    else{
      i-=1;
    }
  }
  return url_list;
};

function randomNumber(min, max) {  
  return Math.floor(Math.random() * (max - min) + min); 
}  


module.exports = {
  getRecommendedImageURL,
};

