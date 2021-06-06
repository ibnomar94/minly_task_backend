const port = process.env.PORT || 3000 ;
const express = require('express') ;
const app = express();
const path = require('path') ;
const db = require('./models') ;
const { Image } = require('./models') ;
const multer = require('multer') ;
const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,'storage') ;
    },
    filename: function (req,file,cb){
        cb(null,Date.now()+path.extname(file.originalname)) ;
    }
}) ;

const fileFilter = (req,file,cb) => {
//    cb(null,true) ;
    console.log("===================="+file.mimetype);
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true) ;
    }else{
        cb("Wrong File Format",false) ;
    }
} ;
const upload = multer({
    storage:storage,
    fileFilter: fileFilter
});

app.use(express.json()) ;
app.use('/uploads',express.static('storage')) ;

app.get('/api/images',function (req,res){
    const numberOfResultsPerPage = 10 ;
    var offset = req.query.offset | 0;
    var limit = 9999999999;
    const page = req.query.page | 0;

    if(page !== 0){
        offset = (page-1) * numberOfResultsPerPage ;
        limit = 10 ;
    }

    console.log(offset) ;
    console.log(limit) ;

    Image.findAll(
        {
            offset: offset ,
            limit: limit,
            order: [
                ['id', 'DESC'],
            ],
        }
    ).then((images)=>{
        var response = {
            success:'success',
            images: images
        }
        res.send(response) ;
    }).catch(err =>{
        if(err){
            var response = {
                errorDesc: err
            }
            res.status(500).send(response) ;
            return ;
        }
    });

});

const uploadImage =upload.single('image') ;
app.post('/api/images',(req,res) => {
    uploadImage(req, res, function (err) {
        if (err) {
            var response = {
                errorDesc: err
            }
            res.status(500).send(response) ;
            return ;
        }

        if(!req.hasOwnProperty('file')){
            var response = {
                errorDesc: 'File Must Be Sent'
            }
            res.status(500).send(response) ;
            return ;
        }
        Image.create({
            path:req.file.filename
        }).catch(err =>{
            if(err){
                var response = {
                    errorDesc: err
                }
                res.status(500).send(response) ;
                return ;
            }
        }).then(()=>{
            var response = {
                success: 'success',
                fileName: req.file.filename
            }
            res.status(201).send(response) ;
        });
    })
});

db.sequelize.sync().then((req) =>{
    app.listen(port,function (){
        console.log(`Listening on port ${port}`) ;
    }) ;
}) ;
