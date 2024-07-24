/* eslint-disable no-unused-vars */
// import React from "react";
// import { useState, useEffect } from "react";
// import { useRecoilValue } from "recoil";
// import userAtom from "../atoms/userAtom";

// const Search = () => {
//   const user = useRecoilValue(userAtom);
//   const [Text, setText] = useState("");
//   const [Data, setData] = useState([
//     {
//       name: user.name,
//       username: user.username,
//       profilePic: user.profilePic,
//       status: "Search",
//     },
//   ]);
//   const [Toggle, setToggle] = useState("Request");
//   const [css, setcss] = useState(
//     "accept border border-white rounded-md px-2 font-semibold bg-blue-600"
//   );

//   const handleChange = (value) => {
//     setText(value);
//   };

//   const find = () => {
//     data(Text, user);
//     setText("");
//     changeButton();
//   };

//   useEffect(() => {
//     changeButton();
//   }, [Data]);

//   const followorUnfollow = async (user, username, status) => {
//     const res = await fetch(`/api/users/search-action`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ user, username, status }),
//     });

//     if (Toggle == "Request") {
//       setToggle("Requested");
//       setcss(
//         "accept border border-white rounded-md px-2 font-semibold bg-grey-600"
//       );
//     } else if (Toggle == "Requested") {
//       setToggle("Request");
//       setcss(
//         "accept border border-white rounded-md px-2 font-semibold bg-blue-600"
//       );
//     } else {
//       setToggle("");
//       setcss("");
//     }
//   };

//   const data = async (username, user) => {
//     const res = await fetch(`/api/users/Search`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ username, user }),
//     });

//     const arr = await res.json();
//     setData(arr);
//     changeButton();
//   };

//   const changeButton = () => {
//     if (Data[0].status == "Request") {
//       setToggle("Request");
//       setcss(
//         "accept border border-white rounded-md px-2 font-semibold bg-blue-600"
//       );
//     } else if (Data[0].status == "Requested") {
//       setToggle("Requested");
//       setcss(
//         "accept border border-white rounded-md px-2 font-semibold bg-grey-600"
//       );
//     } else {
//       setToggle("");
//       setcss("");
//     }
//   };

//   return (
//     <>
//       <div>
//         <div className="search 2xl:w-[26rem] xl:w-[20.5rem] lg:w-[20.5rem] fixed z-10">
//           <div className="search flex items-center rounded-full bg-[#202327] text-[#71767b] focus-within:border  focus-within:border-[#1D9BF0] focus-within:fill-[#1D9BF0] fill-[#71767b]/80 m-3 z-10">
//             <div className="search-icon p-2.5"></div>
//             <input
//               type="text"
//               placeholder="Search"
//               className=" w-full rounded-r-full bg-[#202327] focus:outline-none focus:border-[#1D9BF0] p-2 text-white font-semibold"
//               value={Text}
//               onChange={(e) => handleChange(e.target.value)}
//             />
//             <svg
//               viewBox="0 0 24 24"
//               aria-hidden="true"
//               className="w-5 fill-inherit mr-4 cursor-pointer"
//               onClick={find}
//             >
//               <g>
//                 <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
//               </g>
//             </svg>
//           </div>
//         </div>
//       </div>

//       <div className="contain mt-16">
//         {Data[0].status !== "Search" ? (
//           Data[0].status === "NotFound" ? (
//             <div className="text-2xl font-bold">No Usere Found !!!</div>
//           ) : Data[0].username === user.username ? (
//             <div className="text-2xl font-bold">
//               You Are Searching Yourself!!!
//             </div>
//           ) : (
//             <div
//               className="follow-request border border-white rounded-xl w-full h-16 p-4 flex justify-between items-center my-4"
//               id={Data[0].username}
//             >
//               <div className="follower-info flex gap-4">
//                 <img
//                   src={Data[0].profilePic}
//                   alt="none"
//                   className="h-12 w-12 rounded-full"
//                 />
//                 <div>
//                   <div className="username font-bold text-xl cursor-default">
//                     {Data[0].username}
//                   </div>
//                   <div className="name text-xs font-extralight opacity-50 cursor-default">
//                     {Data[0].name}
//                   </div>
//                 </div>
//               </div>

//               <div className="buttons flex gap-4">
//                 <button
//                   className={css}
//                   onClick={() =>
//                     followorUnfollow(user._id, Data[0].username, Toggle)
//                   }
//                 >
//                   {Toggle}
//                 </button>
//               </div>
//             </div>
//           )
//         ) : (
//           <div className="text-2xl font-bold">Search Here!!!</div>
//         )}
//       </div>

//       <div className="info absolute top-16 z-20 left-36 border border-white w-5/6 h-[40rem] bg-black"></div>
//     </>
//   );
// };

// export default Search;

import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const Search = () => {
  const user = useRecoilValue(userAtom);
  const [Text, setText] = useState("");
  const [Profile, setProfile] = useState(true);
  const [Data, setData] = useState([
    {
      name: user.name,
      username: user.username,
      profilePic: user.profilePic,
      status: "Search",
    },
  ]);
  const [Toggle, setToggle] = useState("Request");
  const [css, setcss] = useState(
    "accept border border-white rounded-md px-2 font-semibold bg-blue-600"
  );

  const handleChange = (value) => {
    setText(value);
  };

  const find = () => {
    data(Text, user);
    setText("");
    changeButton();
  };

  useEffect(() => {
    changeButton();
  }, [Data]);

  const followorUnfollow = async (user, username, status) => {
    const res = await fetch("/api/users/search-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user, username, status }),
    });

    if (Toggle == "Request") {
      setToggle("Requested");
      setcss(
        "accept border border-white rounded-md px-2 font-semibold bg-grey-600"
      );
    } else if (Toggle == "Requested") {
      setToggle("Request");
      setcss(
        "accept border border-white rounded-md px-2 font-semibold bg-blue-600"
      );
    } else {
      setToggle("");
      setcss("");
    }
  };

  const data = async (username, user) => {
    const res = await fetch("/api/users/Search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, user }),
    });

    const arr = await res.json();
    setData(arr);
    changeButton();
  };

  const changeButton = () => {
    if (Data[0].status == "Request") {
      setToggle("Request");
      setcss(
        "accept border border-white rounded-md px-2 font-semibold bg-blue-600"
      );
    } else if (Data[0].status == "Requested") {
      setToggle("Requested");
      setcss(
        "accept border border-white rounded-md px-2 font-semibold bg-grey-600"
      );
    } else {
      setToggle("");
      setcss("");
    }
  };

  const showUser = () => {
    setProfile(!Profile);
  };

  return (
    <>
      {Profile && (
        <>
          {" "}
          <div>
            <div className="search 2xl:w-[26rem]  xl:w-[20.5rem] lg:w-[20.5rem] sticky z-10">
              <div className="search position flex items-center rounded-full bg-[#202327] text-[#71767b] focus-within:border  focus-within:border-[#1D9BF0] focus-within:fill-[#1D9BF0] fill-[#71767b]/80 m-3 z-10">
                <div className="search-icon p-2.5"></div>
                <input
                  type="text"
                  placeholder="Search"
                  className=" w-full rounded-r-full bg-[#202327] focus:outline-none focus:border-[#1D9BF0] p-2 text-white font-semibold"
                  value={Text}
                  onChange={(e) => handleChange(e.target.value)}
                />
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="w-5 fill-inherit mr-4 cursor-pointer"
                  onClick={find}
                >
                  <g>
                    <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div className="contain mt-6">
            {Data[0].status !== "Search" ? (
              Data[0].status === "NotFound" ? (
                <div className="text-2xl font-bold">No Usere Found !!!</div>
              ) : Data[0].username === user.username ? (
                <div className="text-2xl font-bold">
                  You Are Searching Yourself!!!
                </div>
              ) : (
                <div
                  className="follow-request border border-white rounded-xl w-full h-16 p-4 flex justify-between items-center my-4"
                  id={Data[0].username}
                >
                  <div className="follower-info flex gap-4">
                    <img
                      src={Data[0].profilePic}
                      alt="none"
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <button
                        className="username font-bold text-xl"
                        onClick={() => showUser()}
                      >
                        {Data[0].username}
                      </button>
                      <div className="name text-xs font-extralight opacity-50 cursor-default">
                        {Data[0].name}
                      </div>
                    </div>
                  </div>

                  <div className="buttons flex gap-4">
                    <button
                      className={css}
                      onClick={() =>
                        followorUnfollow(user._id, Data[0].username, Toggle)
                      }
                    >
                      {Toggle}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="text-2xl font-bold ml-8">Search Here!!!</div>
            )}
          </div>
        </>
      )}

      {!Profile && (
        <>
          <div className="absolute left-[50vw] -translate-x-1/2 border border-[#ffffff40] h-[55vh] w-[40vw] bg-[#101010] rounded-xl p-12">
            <button
              className="cross absolute top-6 right-6 font-black"
              onClick={() => showUser()}
            >
              X
            </button>
            <div className="flex justify-between">
              <div className="names flex flex-col items-end gap-1">
                <div className="username font-bold text-3xl">
                  {Data[0].username}
                </div>
                <div className="name text-sm opacity-70">{Data[0].name}</div>
              </div>
              <div className="avatar border  border-white rounded-full w-20 h-20">
                <img
                  src={Data[0].profilePic}
                  alt="icon"
                  className="w-full h-full rounded-full"
                />
              </div>
            </div>
            <div className="followers mt-14 opacity-70">
              {Data[0].followers} followers
            </div>
            <div className="w-[40vw] -translate-x-[3rem] opacity-70 border border-white my-8"></div>
            <div className="bio">
              {Data[0].bio != "" ? Data[0].bio : <div>Bio Here</div>}
            </div>
          </div>
        </>
      )}
      {/* <div>
        <div className="search 2xl:w-[26rem] xl:w-[20.5rem] lg:w-[20.5rem] fixed z-10">
          <div className="search flex items-center rounded-full bg-[#202327] text-[#71767b] focus-within:border  focus-within:border-[#1D9BF0] focus-within:fill-[#1D9BF0] fill-[#71767b]/80 m-3 z-10">
            <div className="search-icon p-2.5"></div>
            <input
              type="text"
              placeholder="Search"
              className=" w-full rounded-r-full bg-[#202327] focus:outline-none focus:border-[#1D9BF0] p-2 text-white font-semibold"
              value={Text}
              onChange={(e) => handleChange(e.target.value)}
            />
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-5 fill-inherit mr-4 cursor-pointer"
              onClick={find}
            >
              <g>
                <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="contain mt-16">
        {Data[0].status !== "Search" ? (
          Data[0].status === "NotFound" ? (
            <div className="text-2xl font-bold">No Usere Found !!!</div>
          ) : Data[0].username === user.username ? (
            <div className="text-2xl font-bold">
              You Are Searching Yourself!!!
            </div>
          ) : (
            <div
              className="follow-request border border-white rounded-xl w-full h-16 p-4 flex justify-between items-center my-4"
              id={Data[0].username}
            >
              <div className="follower-info flex gap-4">
                <img
                  src={Data[0].profilePic}
                  alt="none"
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <div className="username font-bold text-xl cursor-default">
                    {Data[0].username}
                  </div>
                  <div className="name text-xs font-extralight opacity-50 cursor-default">
                    {Data[0].name}
                  </div>
                </div>
              </div>

              <div className="buttons flex gap-4">
                <button
                  className={css}
                  onClick={() =>
                    followorUnfollow(user._id, Data[0].username, Toggle)
                  }
                >
                  {Toggle}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="text-2xl font-bold">Search Here!!!</div>
        )}
      </div> */}
    </>
  );
};

export default Search;
