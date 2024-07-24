import React from "react";
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const NotificationPage = () => {
  const user = useRecoilValue(userAtom);
  const [data, setdata] = useState([]);

  const getdata = async () => {
    const res = await fetch(`/api/users/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const arr = await res.json();
    setdata([...arr]);
  };

  const acceptedOrReject = async (username, action) => {
    await fetch(`/api/users/actions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, action, user }),
    });
    getdata();
  };

  useEffect(() => {
    getdata();
  }, [data]);

  return (
    <>
      {data.length === 0 ? (
        <div className="text-3xl font-bold text-center">
          OOPs!!! No New Notifications...
        </div>
      ) : (
        data.map((info,) => (
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
                className="accept border border-white rounded-md px-2 font-semibold bg-green-500"
                onClick={() => acceptedOrReject(info.username, 1)}
              >
                Accept
              </button>
              <button
                className="reject border border-white rounded-md px-2 font-semibold bg-red-600"
                onClick={() => acceptedOrReject(info.username, 0)}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default NotificationPage;
