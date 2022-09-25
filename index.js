//#region PAGE_SETUP
// This contains the code that loads the tool into existance at page load.
document.addEventListener('DOMContentLoaded', () => {
  console.log("S.H.E.A.S. -> Simple Hardware Editor And Simulator!")

  // Build the page
  buildSHEAS('complete', document.getElementById('sheas_container'))

  // Setup the page reading local memory and URL
  setup()

})

function setup() {
  url = new URLSearchParams(window.location.search)
  saved_chip_state = localStorage.getItem('chip')
  // Check if the URL actually contains some chip to load, if not check for chip saved in local memory, if empty load empty chip
  if (url.get('chip')==null || url.get('chip')=='') {
    if (saved_chip_state==null || saved_chip_state=='') {
      load(get_empty_chip(), false)
    } else {
      load(JSON.parse(LZString.decompressFromBase64(saved_chip_state)), false)
    }
  } else {
    load(JSON.parse(LZString.decompressFromBase64(url.get('chip'))), false)
    set_url('chip', '')
  }
  document.getElementById('components').value = url.get('select')
  display_additional_settings()
  if (url.get('bits')!=undefined && url.get('bits')!=null && url.get('bits')!='') document.getElementById('bits').value = url.get('bits')
  save_state()
}
//#endregion
