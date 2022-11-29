module.exports = function myExample() {
    return {
        name: 'my-example',
        resolveId( source) {
            console.log(source)
        }
    }
}