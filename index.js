//#region PAGE_SETUP
// This contains the code that loads the tool into existance at page load.
document.addEventListener('DOMContentLoaded', () => {
  console.log("S.H.E.A.S. -> Simple Hardware Editor And Simulator!")
  // Build the page
  buildSHEAS('complete', document.getElementById('sheas_container'))
})
//#endregion
