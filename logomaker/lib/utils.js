
global.isEmptyString = function (str) {
    if (typeof str != "string"){
        str = getAsStr(str);
    }
    if ((str == undefined) || (str == null))
    {
        return false;
    }
    return (!str || /^\s*$/.test(str) || str.length === 0 || !str.trim() || str.trim().length === 0 );
};

global.getAsStr = function (element){
    var str = element;
    if (typeof element == "number"){
        str = element + "";
    }
    else if (typeof element != "string"){
        str = element.toString();
    }
    return str;
}

global.fillIfNull = function (item, fill) {
    if (item == null || item == undefined || item.trim().length <= 0 || item == "NA") {
        return fill == undefined ? "NA" : fill;
    } else {
        return item;
    }
}