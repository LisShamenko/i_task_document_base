function initPresentationModel(headerElement, mainElement) {

  // ------------------------------------------------------------------------------ dropdown

  // user logo dropdown
  const userLogoDropdown = headerElement.querySelector("#userLogoDropdown");
  const documentName = headerElement.querySelector("#document_name");

  function ShowUserLogoMenu() {
    userLogoDropdown.classList.toggle("show");
  }

  // hide all dropdowns
  window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
      let dropdowns = document.getElementsByClassName("dropdown-content");
      for (let i = 0; i < dropdowns.length; i++) {
        let openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

  // ------------------------------------------------------------------------------ separator

  // separator
  const first = mainElement.querySelector("#first");
  const second = mainElement.querySelector("#second");
  const separator = mainElement.querySelector("#separator");

  // 
  let isShowObjectsList = true;

  // update resizer
  let beforeWidth = window.innerWidth;
  window.addEventListener('resize', function (e) {
    let deltaWidth = window.innerWidth - beforeWidth;
    if (deltaWidth > 0) {
      if (isShowObjectsList) {
        first.style.width = (first.offsetWidth + deltaWidth) + "px";
        second.style.width = (second.offsetWidth) + "px";
      }
      else {
        second.style.width = (second.offsetWidth + deltaWidth) + "px";
      }
    }
    beforeWidth = window.innerWidth;
  });

  // 
  var mouseDown;
  separator.onmousedown = onMouseDown;
  function onMouseDown(e) {
    if (!isShowObjectsList) return;

    // 
    mouseDown = {
      e,
      offsetLeft: separator.offsetLeft,
      offsetTop: separator.offsetTop,
      firstWidth: first.offsetWidth,
      secondWidth: second.offsetWidth,
    };

    document.onmousemove = onMouseMove;
    document.onmouseup = () => {
      document.onmousemove = document.onmouseup = null;
    }
  }

  function onMouseMove(e) {

    var delta = {
      x: e.clientX - mouseDown.e.clientX,
      y: e.clientY - mouseDown.e.clientY
    };

    // Prevent negative-sized elements
    delta.x = Math.min(Math.max(delta.x, -mouseDown.firstWidth), mouseDown.secondWidth);
    /*separator.style.left = mouseDown.offsetLeft + delta.x + "px";*/
    first.style.width = (mouseDown.firstWidth + delta.x) + "px";
    second.style.width = (mouseDown.secondWidth - delta.x) + "px";
  }

  // show / hide objects list
  function ShowHideObjectsList() {
    if (isShowObjectsList) {
      let secondWidth = second.offsetWidth;
      let firstWidth = first.offsetWidth;
      first.style.width = "0px";
      separator.style.width = "0px";
      second.style.width = (secondWidth + firstWidth + 10) + "px";
    }
    else {
      let secondWidth = second.offsetWidth;
      let firstWidth = (secondWidth - 10) / 2;
      second.style.width = (secondWidth - 10 - firstWidth) + "px";
      separator.style.width = "10px";
      first.style.width = firstWidth + "px";
    }
    isShowObjectsList = !isShowObjectsList;
  }

  // ------------------------------------------------------------------------------ table objects list

  const objectsList = mainElement.querySelector("#objects_list");

  function addRow(rowData) {

    // 
    let td_id = document.createElement("td");
    let td_type = document.createElement("td");
    let td_starred = document.createElement("td");
    let td_shared = document.createElement("td");
    let td_name = document.createElement("td");
    let td_date = document.createElement("td");



    // 
    let tr = document.createElement("tr");
    tr.appendChild(td_id);
    tr.appendChild(td_type);
    tr.appendChild(td_starred);
    tr.appendChild(td_shared);
    tr.appendChild(td_name);
    tr.appendChild(td_date);

    // 
    tr.addEventListener('click', function (e) {
      if (rowData.type == 0) {
        showObjectsList(rowData.id);
      }
      else {
        documentName.innerHTML = `--- ID: ${rowData.id} --- Name: ${rowData.name} ---`;
      }
    });

    // 
    let tbody = objectsList.getElementsByTagName('tbody')[0];
    tbody.appendChild(tr);

    // 
    td_id.innerHTML = rowData.id;
    td_id.style.display = "none";
    td_type.innerHTML = getModeName(rowData.type);
    td_starred.innerHTML = rowData.starred;
    td_shared.innerHTML = rowData.shared;
    td_name.innerHTML = rowData.name;
    td_date.innerHTML = rowData.date;
  }

  function clearObjectsList() {
    var rowCount = objectsList.rows.length;
    for (var i = 1; i < rowCount; i++) {
      objectsList.deleteRow(1);
    }
  }

  // ------------------------------------------------------------------------------ path

  const objectsPath = mainElement.querySelector("#objects_path");

  function addPath(folderId, name) {
    let span = document.createElement("span");
    span.innerHTML = `<a onclick="onShowFolder(${folderId});">${name}</a><span>/</span>`;
    objectsPath.appendChild(span);
  }

  function clearPath() {
    objectsPath.innerHTML = `<a onclick="onShowFolder(0);">ROOT:</a><span>/</span>`;
  }

  function fillPath(folders) {
    clearPath();
    for (let i = 1; i < currentFolders.length; i++) {
      let folderId = currentFolders[i];
      let folderItem = folders.find(item => item.id == folderId);
      addPath(folderId, folderItem.name);
    }
  }

  // ------------------------------------------------------------------------------ local storage

  // presentation objects list
  let presentationMode;
  let currentFolderId;
  let currentFolders;

  function initLocalSettings() {
    let localStorage = window.localStorage;

    // dashboards / reports
    presentationMode = localStorage.getItem("mode");
    if (presentationMode == "dashboards")
      presentationMode = 1;
    else if (presentationMode == "reports")
      presentationMode = 2;
    else
      setDashboardsMode();

    // root=0
    currentFolderId = localStorage.getItem("folder");
    if (currentFolderId == null) {
      setCurrentFolder(0);
    }
    else {
      let parsed = parseInt(currentFolderId, 10);
      if (isNaN(parsed))
        setCurrentFolder(0);
      else
        currentFolderId = parsed;
    }

    // 
    currentFolders = localStorage.getItem("folders");
    if (currentFolders == null) {
      setCurrentFolders([0]);
    }
    else {
      currentFolders = currentFolders.split(',');

      // 
      let newFolders = [];
      for (let i = 0; i < currentFolders.length; i++) {
        let parsed = parseInt(currentFolders[i], 10);
        if (isNaN(parsed)) break;
        newFolders.push(parsed);
      }

      // 
      if (newFolders.length >= 1 && newFolders[0] == 0)
        currentFolders = newFolders;
      else
        setCurrentFolders([0]);
    }
  }

  function getModeName(mode) {
    if (mode == 0)
      return "folder";
    else if (mode == 1)
      return "dashboards";
    else if (mode == 2)
      return "reports";
    else
      return "unknown";
  }

  function setDashboardsMode() {
    let localStorage = window.localStorage;
    localStorage.setItem("mode", "dashboards");
    presentationMode = 1;
  }

  function setReportsMode() {
    let localStorage = window.localStorage;
    localStorage.setItem("mode", "reports");
    presentationMode = 2;
  }

  function setCurrentFolder(folderId) {
    let localStorage = window.localStorage;
    localStorage.setItem("folder", folderId);
    currentFolderId = folderId;
  }

  function setCurrentFolders(newFolders) {
    let localStorage = window.localStorage;
    localStorage.setItem("folders", newFolders.join(','));
    currentFolders = newFolders;
  }

  function getFolderId() { return currentFolderId; }
  function getMode() { return presentationMode; }
  function getFoldersPath() { return currentFolders; }

  function updateCurrentFolderId(foldersInFolder, folderId) {
    if (folderId === undefined) {
      folderId = currentFolderId;
    }
    else if (folderId === 0) {
      setCurrentFolder(folderId);
      setCurrentFolders([0]);
    }
    else if (currentFolders.some(item => item == folderId)) {

      let newFolders = [];
      for (let i = 0; i < currentFolders.length; i++) {
        newFolders.push(currentFolders[i]);
        if (currentFolders[i] == folderId) break;
      }

      // 
      setCurrentFolder(folderId);
      setCurrentFolders(newFolders);
    }
    else {
      currentFolders.push(folderId);

      // 
      let prevId = currentFolders[0];
      let newFolders = [0];
      for (let i = 1; i < currentFolders.length; i++) {
        let nextId = currentFolders[i];

        // 
        let isOk = foldersInFolder.some((item) => {
          return (item.parent_id == prevId) && (item.child_id == nextId);
        });

        // 
        if (!isOk) break;
        prevId = nextId;
        newFolders.push(nextId);
      }

      // 
      folderId = prevId;
      setCurrentFolder(prevId);
      setCurrentFolders(newFolders);
    }
    return folderId;
  }

  // ------------------------------------------------------------------------------ show

  let viewData;

  function setViewData(data) {
    viewData = data;
  }

  function showObjectsList(folderId) {

    // 
    let data = viewData.getViewData();
    folderId = updateCurrentFolderId(data.foldersToFolder, folderId);

    // files ids
    let filesIds = [];
    data.filesToFolder.forEach(function (item, i, arr) {
      if (item.parent_id == folderId) {
        filesIds.push(item.child_id);
      }
    });

    // files ids
    let foldersIds = [];
    data.foldersToFolder.forEach(function (item, i, arr) {
      if (item.parent_id == folderId) {
        foldersIds.push(item.child_id);
      }
    });

    // 
    let folders = data.folders.filter(function (item) {
      return foldersIds.some(id => id == item.id);
    });

    // 
    let files = data.files.filter(function (item) {
      if (item.type !== presentationMode) return false;
      return filesIds.some(id => id == item.id);
    });

    // 
    clearObjectsList();
    folders.forEach(folder => addRow(folder));
    files.forEach(file => addRow(file));

    // 
    fillPath(data.folders);
  }

  // ------------------------------------------------------------------------------ 

  return {
    ShowUserLogoMenu: ShowUserLogoMenu,
    ShowHideObjectsList: ShowHideObjectsList,
    addRow: addRow,
    initLocalSettings: initLocalSettings,
    setViewData: setViewData,
    showObjectsList: showObjectsList,
    setDashboardsMode: setDashboardsMode,
    setReportsMode: setReportsMode,
    getFolderId: getFolderId,
    getMode: getMode,
    getFoldersPath: getFoldersPath,
  };
}