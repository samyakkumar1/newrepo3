// Get the modal
var modalta = document.getElementById("info-model-ta");
var modalcl = document.getElementById("info-model-cl");

// Get the button that opens the modal
var btnta = document.getElementById("info-btn-ta");
var btncl = document.getElementById("info-btn-cl");

// Get the <span> element that closes the modal
var spanta = document.getElementById("closeta");
var spancl = document.getElementById("closecl");

// When the user clicks on the button, open the modal
btnta.onclick = function() {
  modalta.style.display = "block";
}

btncl.onclick = function() {
    modalcl.style.display = "block";
  }

// When the user clicks on <span> (x), close the modal
spanta.onclick = function() {
  modalta.style.display = "none";
}

// When the user clicks on <span> (x), close the modal
spancl.onclick = function() {
    modalcl.style.display = "none";
  }



