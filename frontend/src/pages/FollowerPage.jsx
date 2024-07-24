import React from "react";
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const FollowerPage = () => {
 const user = useRecoilValue(userAtom);
 const [data, setdata] = useState([]);
 const [followers, setfollowers] = useState([]);
 const [following, setfollowing] = useState([]);
 const [id, setid] = useState("followers")
 const [dullCSS, setdullCSS] = useState(
  "text-xl font-bold opacity-70 cursor-pointer"
 );
 const [brightCSS, setbrightCSS] = useState(
  "text-xl font-bold cursor-pointer"
 );
 const [followerCSS, setfollowerCSS] = useState(brightCSS);
 const [followingCSS, setfolloweingCSS] = useState(dullCSS);

 const getdata = async () => {
  if (id === "followers") {
   const res = await fetch(`/api/users/followers`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
   });
 
   const arr = await res.json();
   setfollowers([...arr]);
  } else {
   const res = await fetch(`/api/users/following`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
   });

   const arr = await res.json();
   setfollowing([...arr]);
  }
 };

 const remove = async (username) => {
  await fetch(`/api/users/remove`, {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
   },
   body: JSON.stringify({ username, user }),
  });
  getdata();
 };

 const removed = async (username) => {
  await fetch(`/api/users/removed`, {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
   },
   body: JSON.stringify({ username, user }),
  });
  getdata();
 };

 const focus = (params) => {

  if (params === id) {
   setid(params)
  } else {
   if (params === "followers") {
    setid("followers")
   } else {
    setid("following")
   }
  }

   if (id === "followers") {
    setfollowerCSS(brightCSS);
    setfolloweingCSS(dullCSS);
   } else {
    setfollowerCSS(dullCSS);
    setfolloweingCSS(brightCSS);
   }
 };

 useEffect(() => {
  getdata();
 }, [followers,following]);

 return (
  <>
   <div className="flex justify-around border border-b-2 border-x-0 border-t-0 p-4">
    <button className={followerCSS} onClick={() => focus("followers")}>
     Followers
    </button>
    <button className={followingCSS} onClick={() => focus("following")}>
     Following
    </button>
   </div>
   <div>
    {id === "followers" ? (
     followers.length === 0 ? (
      <div className="text-3xl font-bold text-center my-16">
       Seems Like Nobody Follows You
      </div>
     ) : (
      followers.map((info) => (
       <div
        className="follow-request border border-white rounded-xl w-full h-16 p-4 flex justify-between items-center my-4"
        id={info.username}
       >
        <div className="follower-info flex gap-4">
         <img
          src={info.profilePic}
          alt="none"
          className="h-12 w-12 rounded-full"
         />
         <div>
          <div className="username font-bold text-xl cursor-default">
           {info.username}
          </div>
          <div className="name text-xs font-extralight opacity-50 cursor-default">
           {info.name}
          </div>
         </div>
        </div>

        <div className="buttons flex gap-4">
         <button
          className="accept border border-white rounded-md px-2 font-semibold bg-red-600"
          onClick={() => remove(info.username)}
         >
          Remove
         </button>
        </div>
       </div>
      ))
     )
    ) : following.length === 0 ? (
     <div className="text-3xl font-bold text-center my-16">
      Seems Like You Don't Follow Anybody
     </div>
    ) : (
     following.map((info) => (
      <div
key={info.username}
       className="follow-request border border-white rounded-xl w-full h-16 p-4 flex justify-between items-center my-4"
       id={info.username}
      >
       <div className="follower-info flex gap-4">
        <img
         src={info.profilePic}
         alt="none"
         className="h-12 w-12 rounded-full"
        />
        <div>
         <div className="username font-bold text-xl cursor-default">
          {info.username}
         </div>
         <div className="name text-xs font-extralight opacity-50 cursor-default">
          {info.name}
         </div>
        </div>
       </div>

       <div className="buttons flex gap-4">
        <button
         className="accept border border-white rounded-md px-2 font-semibold bg-red-600"
         onClick={() => removed(info.username,id)}
        >
         Remove
        </button>
       </div>
      </div>
     ))
    )}
   </div>
  </>
 );
};

export default FollowerPage;