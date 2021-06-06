module.exports = (sequelize,DataTypes) => {
    const Image = sequelize.define("Image",{
            path:{
                type:DataTypes.STRING,
                allowNull:false,
                validate:{
                    notEmpty:true
                }
            }
        }
    );
    return Image;
}