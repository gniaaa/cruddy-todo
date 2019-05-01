const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((error, id) => {
    if (error) {
      throw ('error getting new ID!');
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
        if (err) {
          throw ('error saving text to file');
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('error reading directory');
    } else {
      var dataPromises = _.map(files, file => {
        return exports.readOneAsync(path.parse(file).name);
      })

      return Promise.all(dataPromises)
        .then((arrayOfData) => {
          callback(null, arrayOfData)
        });
    }
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (error, data) => {
    if (error) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: data });
    }
  })
};

exports.readOneAsync = Promise.promisify(exports.readOne);
// exports.readOneAsync = (id) => {
//   return new Promise((resolve, reject) => {
//     fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (error, data) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve({ id, text: data });
//       }
//     });
//   });
// }

exports.update = (id, text, callback) => {
  exports.readOne(id, (error, file) => {
    if (error) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (error) => {
        if (error) {
          callback(new Error(`Cannot write to file!`));
        } else {
          callback(null, { id, text })
        }
      })
    }
  })
};


exports.delete = (id, callback) => {
  fs.unlink(`${exports.dataDir}/${id}.txt`, (error) => {
    if (error) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  })
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
