
export const GameObjects = (function () {
    let objects = [];

    function add(obj, type) {
        obj.type = Array.isArray(type) ? type : [type];
        obj.id = objects.length;
        objects.push(obj);
        return obj.id;
    }

    function remove(id) {
        objects = objects.filter(el => el.id !== id);
    }

    function all(type) {
        return type ? objects.filter(el => el.type.includes(type)) : objects;
    }

    return { add, all, remove };
}());
