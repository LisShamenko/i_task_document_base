function initViewModel() {

  let viewData = null;

  function getViewData() {
    return viewData;
  }

  function getAllDataAjax(cbFunc) {
    minAjax({
      url: "getAllData",
      type: "GET",
      success: function (response) {
        viewData = JSON.parse(response);
        cbFunc(viewData);
      }
    });
  }

  function addNewFolder(parentId, cbFunc) {
    minAjax({
      url: "addNewFolder",
      type: "POST",
      data: {
        ParentId: parentId
      },
      success: function (response) {
        let result = JSON.parse(response);
        if (result.Status != 'success') cbFunc(null);
        cbFunc(result.Result.folder);
        viewData.folders.push(result.Result.folder);
        viewData.foldersToFolder.push(result.Result.folderToFolder);
      }
    });
  }  

  function addNewFile(parentId, typeFile, cbFunc) {
    minAjax({
      url: "addNewFile",
      type: "POST",
      data: {
        ParentId: parentId,
        TypeFile: typeFile,
      },
      success: function (response) {
        let result = JSON.parse(response);
        if (result.Status != 'success') cbFunc(null);
        cbFunc(result.Result.file);
        viewData.files.push(result.Result.file);
        viewData.filesToFolder.push(result.Result.fileToFolder);        
      }
    });
  }  

  return {
    getViewData: getViewData,
    getAllDataAjax: getAllDataAjax,
    addNewFolder: addNewFolder,
    addNewFile: addNewFile
  };
}
