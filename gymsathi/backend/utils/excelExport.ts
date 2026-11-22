const XLSX = require("xlsx");

exports.exportMembers = (data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");

  XLSX.writeFile(wb, "members.xlsx");
};