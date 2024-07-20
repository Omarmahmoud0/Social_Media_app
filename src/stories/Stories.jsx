import React, { useContext, useEffect, useState } from 'react'
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { Swiper, SwiperSlide } from 'swiper/react';
import './stories.scss'
import 'swiper/css';
import 'swiper/css/pagination';

import { Pagination } from 'swiper/modules';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../Components/firebase/firebase';
import { toast } from 'react-toastify';
import Skeleton from "@mui/material/Skeleton";
import { UserContext } from '../UserContext';
import 'animate.css';
import ShowStorie from '../Components/showStorie/ShowSotrie';






const Stories = () => {

  const userDetails = useContext(UserContext)
  
  const [imgStory, setImgStory] = useState('')

  const [Story,setStory] = useState('')

  const [Progress,setProgress] = useState(null)

  const [model , setModel] = useState(false)

  const [Storydata ,setStoryData] = useState([])

  const [ShowStory, setShowStory] = useState(false)

console.log(Storydata);

  useEffect(() => {
    const uploadStory = () =>{

      const storageRef = ref(storage, imgStory.name)
      const uploadTask = uploadBytesResumable(storageRef, imgStory);
      uploadTask.on('state_changed', 
      (snapshot) => {

        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        setProgress(progress)
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
        console.log(error);
      }, 
      () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            setStory(downloadURL)
          });
        }
      );
    }
    imgStory && uploadStory()
  },[imgStory])

  useEffect(() => {
    const q = query(collection(db, "stories"),orderBy("timeStamp","desc"))
    const unsub = onSnapshot(q, (snapShot) => {
      let List = [];
      snapShot.docs.forEach((doc)  => {
        List.push({id: doc.id , ...doc.data()})
      })
      setStoryData(List)
    },(error) => {
      console.log(error);
    });
    
    return () => {
      unsub()
    }
},[])

  
  const AddStory = async(e) => {

    e.preventDefault()
    if(Story == ""){
      return toast.error("The story field is required",{position:"bottom-right"})
    }
    try{
      await addDoc(collection(db,"stories"), {
        author: userDetails.name,
        ProfileImg: userDetails.ProfileImg,
        img: Story,
        uid: userDetails.uid,
        timeStamp: serverTimestamp()
      });
      toast.success("Created successfully",{position:"top-center"})
      setStory("")
      setModel(false)
    } catch (error) {
      console.log(error);
    }
  }

  const handlToggle = () => {
    setModel(!model)
  }


  return(
  <div className='stories'>

    <div className='story'>
    {userDetails ? <img src={userDetails.ProfileImg} alt="" /> : <Skeleton variant="rounded" width="100%" height="100%" />}
      <div onClick={handlToggle} className="model">
        <h4>Create Story</h4>
        <AddCircleRoundedIcon className='icon'/>
      </div>
    </div>

    {model && <div className="show animate__animated animate__fadeIn animate__faster">
          <div className="UploadStory">
            <div className="container">
              <div className="header">
                <h3>Story</h3>
              </div>
              {/* <form onSubmit={AddStory}> */}
                <div className="midel">
                  <p>Upload your Story</p>
                  <input type="file" onChange={(e) => {setImgStory(e.target.files[0])}}/>
                </div>
                <div className="buttons">
                  <button onClick={handlToggle}>Close</button>
                  <button onClick={AddStory} disabled={Progress !== null && Progress < 100}>Upload Stroy</button>
                </div>
              {/* </form> */}
            </div>
          </div>
      </div>}

    <>
      <Swiper
        slidesPerView={3.5}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
        style={{width:"200px"}}
      >
        
          {Storydata.map((story) => (
            <SwiperSlide key={story.id} onClick={() => setShowStory(true)}>
              
                <img src={story.img} alt="" />
                <span>{story.author}</span>
              
            </SwiperSlide>
          ))}

      </Swiper>
    </>

    { ShowStory && <div className="showStory">
      <ShowStorie setshowStory={setShowStory}/>
    </div>}

  </div>
)
}

export default Stories