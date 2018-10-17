// Build up an array of flattened paths from the 'optimised' nested paths
// e.g. [
//   "path_1",                                                      "path_1",​​​​​
//   "path_2",                                                      "path_2",
//   {
//     "nested": [
//       "sub_path_1",                                              "nested/sub_path_1",
//       "sub_path_2"                                               "nested/sub_path_2",​​​​​
//     ]
//   },
//   {
//     "": [                                                        // Note: empty string can be used to add 'separator'
//       "relative_path"                                            "/relative_path"
//     ]
//   }
// ]
const buildPaths = (nestedPaths, separator = "/", path = "", paths = []) =>
  paths.concat(...nestedPaths.map(nestedPath => {
    if (typeof nestedPath == "string") {                            // Leaf node / path
      return `${path}${nestedPath}`;
    }
    return paths.concat(...Object.entries(nestedPath)
      .map(([currentPath, nextPaths]) =>
        buildPaths(nextPaths, separator, `${path}${currentPath}${separator}`)
      ));
  }));

// Check if the path exists within the nested path structure used to create the flattened paths above
const pathExistsIn = (paths, baseUrl, separator = "/") => path => {
  const fileMatchesPattern = (filePath, pattern, separator, matchQueryString = false) => {
    const [fileName, ...filePaths] = filePath.split(separator).reverse();
    const [patternFileName, ...patternPaths] = pattern.split(separator).reverse();

    if (patternPaths.find((path, index) => path != filePaths[index] && path != "*")) {  // Search for mismatch in paths
      return false;
    }

    const regex = `^([^.?]*).?([^?]*)${matchQueryString ? ".?(.*)$" : ""}`;
    const [, name, ext, query] = fileName.match(regex);
    const [, patternName, patternExt, patternQuery] = patternFileName.match(regex);

    return query == patternQuery &&
      (patternName == "*" || name == patternName) &&
      (!patternExt || patternExt == "*" || ext == patternExt);
  };

  // Remove the prefix and any separator from the given string
  const removePrefix = (string, prefix, separator) =>
    string.match(`(?:${prefix}${separator})?(.*)`)[1];

  const pathExists = (nestedPaths, path) => {
    if (typeof nestedPaths == "string") {                           // Check lookup path for * wild cards
      return fileMatchesPattern(path, nestedPaths, separator);
    }
    
    if (nestedPaths.find(x => x == path) != undefined) {
      return true;
    }

    const subPath = nestedPaths
      .filter(x => typeof x == "object")
      .find(x =>
        Object.entries(x).find(([key]) => path.startsWith(key))
      );

    if (!subPath) {
      return false;
    }

    let [[key, value], ...rest] = Object.entries(subPath);          // Check if more than one entry
    const found = rest.find(([key]) => path.startsWith(key));
    if (found) {
      [key, value] = found;
    }

    return pathExists(value, removePrefix(path, key, separator));   // Find remaining path in subPath
  };

  return pathExists(paths, removePrefix(path, baseUrl, separator));
};

/////////////////////////////////////////////////////////

// const refreshOpenPagesIfRequired = async (version, dbName, indexedDB, clients) => {
//   try {
//     const versions = await updateVersion(version, dbName, indexedDB);
//     console.log("Previous versions:", versions);

//     if (versions.length > 0) {
//       // refreshOpenPages(clients);
//     }
//   } catch (e) {
//     console.log("IndexedDB Error:", e);
//   }
// };

// const updateVersion = (version, dbName, indexedDB) =>
//   new Promise((resolve, reject) => {
//     const dbRequest = indexedDB.open(dbName, 1);

//     dbRequest.onupgradeneeded = event => {
//       const db = event.target.result;
//       db.createObjectStore("settings", {autoIncrement: true});

//       db.onerror = reject;
//     };

//     dbRequest.onsuccess = event => {
//       const db = dbRequest.result;
//       const transaction = db.transaction("settings", "readwrite");

//       transaction.onerror = reject;

//       const settingsStore = transaction.objectStore("settings");
//       const settingsRequest = settingsStore.getAll();

//       settingsRequest.onsuccess = () => resolve(settingsRequest.result);

//       settingsRequest.onerror = reject;

//       settingsStore.add(version);
//     };

//     dbRequest.onerror = reject;
//   });

// const refreshOpenPages = async clients => {
//   const windowClients = await clients.matchAll({type: "window"});   // Get all open windows/tabs controlled by service worker
//   windowClients.forEach(windowClient => windowClient.navigate(windowClient.url));
// };
