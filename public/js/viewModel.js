function initViewModel() {

  let viewData = null;

  function getAllDataAjax(cbFunc) {
    minAjax({
      url: "getAllData",
      type: "GET",
      success: function (response) {
        viewData = response;
        cbFunc(response);
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
        if (response.Status == 'success') cbFunc(null);
        cbFunc(response.Result.folder);
        viewData.folders.push(response.Result.folder);
        viewData.foldersToFolder.push(response.Result.folderToFolder);
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
        if (response.Status == 'success') cbFunc(null);
        cbFunc(response.Result.file);
        viewData.files.push(response.Result.file);
        viewData.filesToFolder.push(response.Result.fileToFolder);        
      }
    });
  }  

  return {
    getAllDataAjax: getAllDataAjax,
    addNewFolder: addNewFolder,
    addNewFile: addNewFile
  };
}



