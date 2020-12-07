// Empty Check
const isEmpty = function (val) {
    return !$.isNumeric(val) && (val === "" || val === null || val === 'null' || val === undefined
        || (typeof val === "object" && !Object.keys(val).length) || Object.keys(val).length === 0);
};


const compareArrays = function(array1, array2) {
    let i, isA1, isA2;
    isA1 = Array.isArray(array1);
    isA2 = Array.isArray(array2);

    if (isA1 !== isA2) { // is one an array and the other not?
        return false;      // yes then can not be the same
    }
    if (! (isA1 && isA2)) {      // Are both not arrays
        return array1 === array2;  // return strict equality
    }
    if (array1.length !== array2.length) { // if lengths differ then can not be the same
        return false;
    }
    // iterate arrays and compare them
    for (i = 0; i < array1.length; i += 1) {
        if (!compareArrays(array1[i], array2[i])) { // Do items compare recursively
            return false;
        }
    }
    return true; // must be equal
};

const getListLength = function (data_list, init_type) {
    if (isEmpty(data_list)){
        if (init_type)
            return 1;
        else
            return 0;
    } else {
        return data_list.length;
    }
};

const intersect = function (a,b) { return $.grep(a,function(i){return $.inArray(i,b)>-1;}); };

// 숫자 값 확인
// 숫자 값이 아닐 경우에 return 0
const intVal = function (i) {
    return typeof i === 'string' ?
        i.replace(/[\$,]/g, '') * 1 :
        typeof i === 'number' ?
            i : 0;
};