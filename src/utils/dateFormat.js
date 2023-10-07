Date.prototype.format = function (format) {
  const year = this.getFullYear();
  const month = ('0' + (this.getMonth() + 1)).slice(-2);
  const day = ('0' + this.getDate()).slice(-2);
  const hour = ('0' + this.getHours()).slice(-2);
  const minute = ('0' + this.getMinutes()).slice(-2);
  const second = ('0' + this.getSeconds()).slice(-2);

  let formattedDate = format.replace('YYYY', year);
  formattedDate = formattedDate.replace('MM', month);
  formattedDate = formattedDate.replace('DD', day);
  formattedDate = formattedDate.replace('hh', hour);
  formattedDate = formattedDate.replace('mm', minute);
  formattedDate = formattedDate.replace('ss', second);

  return formattedDate;
};
