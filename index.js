const _ = require("lodash");
const csv = require("fast-csv");

function loadDatas() {
  const parsedDatas = [];
  let i = 0;
  return new Promise(function(resolve, reject) {
    csv
      .fromPath("datas.csv")
      .on("data", function(data) {
        const row = {
          userId: parseInt(data[0]),
          area: data[1],
          attribute: data[2],
          score: parseInt(data[3]),
          index: i
        };
        parsedDatas.push(row);
        i++;
      })
      .on("end", function() {
        resolve(parsedDatas);
      })
      .on("error", function(err) {
        reject(err);
      });
  });
}

function computeImprovement(rows) {
  return (
    _.sortBy(rows, "index")[rows.length - 1].score -
    _.sortBy(rows, "index")[0].score
  );
}
function computeAttribute(key) {
  return key
    .split("|")
    .slice(1)
    .join("|");
}

loadDatas().then(function(parsedDatas) {
  const averageImprovementGlobal = _.chain(parsedDatas)
    .groupBy(row => row.userId + "|" + row.area + "|" + row.attribute)
    .map((rows, key) => ({
      key: computeAttribute(key),
      improvement: computeImprovement(rows)
    }))
    .groupBy("key")
    .map((rows, key) => ({ key: key, value: _.meanBy(rows, "improvement") }))
    .value();

  console.log(JSON.stringify(averageImprovementGlobal));
});
