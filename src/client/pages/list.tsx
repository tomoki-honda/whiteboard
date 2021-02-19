import * as React from 'react'
import { useEffect, useState } from 'react';
import CardComponent from '../component.tsx/card';
import { ProfileParams } from '../interface/profile';

const ProfilePageComponent = () => {
  const [userId, setUserId] = useState<string>();
  const [profile, setProfile] = useState<ProfileParams>();
  const [editable, setEditable] = useState(false);
  const [ownered, setOwnered] = useState(false);

  const fetchProfileById = (id: string) => {
    fetch(`/api/user?id=${id}`)
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      setProfile({
        department: res.department,
        title: res.title,
        name: res.name,
        icon: res.icon,
        birth: res.birth,
        url: res.url,
        other: res.other,
      });
      setOwnered(res.ownered);
    });
  }

  useEffect(() => {
    const params = window.location.search.slice(1).split('&').reduce((p, c) => {
      const obj = c.split("=");
      p[obj[0]] = obj[1];
      return p;
    }, {} as {[key: string]: string});
    console.log(params)

    setUserId(params.id);
    fetchProfileById(params.id);
  }, [])

  return (
    <>
      <div className="profile">
        {profile ? <CardComponent
          editable={editable}
          id={userId}
          prepareFunction={fetchProfileById}
          name={profile.name}
          icon={profile.icon}
          birth={profile.birth}
          department={profile.department}
          title={profile.title}
          url={profile.url}
          other={profile.other}
        ></CardComponent> : "unknown profile"}
      </div>
      {ownered &&
        <input type="button" value={editable ? "閉じる" : "編集"} onClick={
          () => setEditable(!editable)
        } />
      }
    </>
  )
};

export default ProfilePageComponent;