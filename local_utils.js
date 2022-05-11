/// Function name: Debug
/// Usage: Just wrap around some text
/// Example usage: dbg(function()), dbg(int_value)
module.exports.dbg = async function (func){
    console.log(func);
    return func;
}