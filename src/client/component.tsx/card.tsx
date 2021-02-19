import * as moment from 'moment';
import * as React from 'react'
import { useEffect, useState } from 'react';
import { ProfileParams } from '../interface/profile';

import './card.scss';

interface CardParams extends ProfileParams {
  id?: string;
  editable: boolean;
  prepareFunction: Function;
}

const CardComponent = (params: CardParams) => {
  const [profile, setProfile] = useState<any>();

  useEffect(() => setProfile(params), [])

  if (!profile) return (<></>);

  const textComponent = (name: string, placeholder: string) => {
    const obj = params.editable ? profile : params;
    return (<div className={name + (obj[name] ? "" : " blank")} >
      {params.editable ?
        <input
          type="text"
          placeholder={placeholder}
          value={profile[name] || ""}
          onInput={(e) => setProfile({ ...profile, [name]: (e.target as HTMLInputElement).value })}
        /> :
        ((params as any)[name] ? (params as any)[name] : blankMessage())}
    </div>)
  };

  const saveProfile = () => {
    if (!params.id || !profile) {
      return;
    }
    const method = "POST";
    const headers = { 'Content-Type': 'application/json' }
    const body = JSON.stringify({
      id: params.id,
      department: profile.department,
      title: profile.title,
      name: profile.name,
      icon: profile.icon,
      birth: profile.birth,
      url: profile.url,
      other: profile.other,
    });
    fetch(`/api/user?id=${params.id}`, {
      method, headers, body
    }).then(res => {
      console.log(res);
      params.prepareFunction(params.id);
    })
  }

  const fileClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!params.editable) return;
    const parent = e.target as HTMLDivElement;
    const input = parent.querySelector('#input-icon') as HTMLInputElement;
    if (!!input.click) {
      input.click();
    }
  };

  const resizeImage = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 100;
    canvas.height = 100;

    if (!ctx || !img) return;
    ctx.drawImage(img, 0, 0, 100, 100);

    const dataUrl = canvas.toDataURL();
    console.log([img], [canvas], dataUrl)
    setProfile({ ...profile, icon: dataUrl })
  }

  const changeIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (e.target as HTMLInputElement)?.files;
    const file = files && files.length > 0 ? files.item(0) : null;
    if (!files || !file) return;

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result == 'string') {
        const img = new Image();
        img.onload = () => resizeImage(img);
        img.src = reader.result;
      }
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }
  
  const blankMessage = () => {
    if (params.editable) return "未入力";
    return "";
  }

  return (
    <>
      <div className="card">
        <div className="body">
          <div className="main-container">
            <div className="left-pain">
              <div className={"icon" + (params.department ? "" : " blank")}
                onClick={fileClick}
              >
                <input
                  id="input-icon"
                  type="file"
                  accept="image/*"
                  hidden={true}
                  value={profile[params.icon] || ""}
                  onChange={changeIcon}
                />
                {profile?.icon && <img src={profile.icon} alt=""/>}
              </div>
            </div>
            <div className="right-pain">
              {textComponent("department", "所属")}
              {textComponent("title", "肩書き")}
              {textComponent("name", "氏名")}
            </div>
          </div>
          <div className="sub-container">
            <div className={"birth" + (params.department ? "" : " blank")} >
              {params.birth ? moment(params.birth).format("YYYY年 MM月 DD日") : blankMessage()}
            </div>
            {textComponent("url", "URL")}
            <div className={"other" + (profile.other ? "" : " blank")} >
              {params.editable ?
                <textarea
                  placeholder="特記事項"
                  value={profile.other || ""}
                  onInput={(e) => setProfile({ ...profile, other: (e.target as HTMLInputElement).value })}
                ></textarea> :
                (profile.other ? profile.other : blankMessage())}
            </div>
          </div>
        </div>
      </div>
      {params.editable && <input type="button" value="保存" onClick={saveProfile} />}
    </>
  )
};

export default CardComponent;