import CSVFileValidator from "csv-file-validator";
import similarity from "similarity";

// const CSVConfig = {
//   headers: ['region', 'district', 'date', 'health facility type', 'health facility ownership', 'health facility name'], // required
//   isHeaderNameOptional: true// default (optional)
// }

const CSVConfig = {
  headers: [
    {
      name: "region",
      inputName: "region",
      required: true
    },
    {
      name: "district",
      inputName: "district",

      optional: true
    },
    {
      name: "date",
      inputName: "date",

      unique: true
    },
    {
      name: "health facility type",
      inputName: "health facility type"
    },
    {
      name: "health facility ownership",
      inputName: "health facility ownership"
    },
    {
      name: "health facility name",
      inputName: "health facility name"
    },
    {
      name: "star rating",
      inputName: "star rating",
      validate: isStarRatingValid,
      required: true
    }
  ]
};

const requiredError = (headerName) => {
  return `<div class="red">${headerName} is required`;
};

const validateError = (headerName, rowNumber, columnNumber) => {
  return `<div class="red">${headerName} is not valid in the <strong>${rowNumber} row</strong> / <strong>${columnNumber} column</strong></div>`;
};

const uniqueError = (headerName, rowNumber) => {
  return `<div class="red">${headerName} is not unique at the <strong>${rowNumber} row</strong></div>`;
};

const isHealthFacilityValid = function (healthFacility) {
  return healthFacility.length > 0;
};

const isDateValid = function (date) {
  // test for dd/mm/yyyy, dd-mm-yyyy or dd.mm.yyyy
  let dateRegExp = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g;
  return dateRegExp.test(date);
};

const isStarRatingValid = function (rating) {
  // check if star rating is number
  let starRegExp = /^\d+$/;
  return starRegExp.test(rating);
};

document.getElementById("selectFiles").onchange = function (event) {
  const file = event.target.files[0];
  console.log(file);
  CSVFileValidator(file, CSVConfig).then((csvData) => {
    csvData.inValidMessages.forEach((message) => {
      document
        .getElementById("invalidMessages")
        .insertAdjacentHTML("beforeend", message);
    });
  });
};
