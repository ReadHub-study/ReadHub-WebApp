import React, { useState } from "react";
import ContCard from "../Components/ContCard";
import { useNavigate } from "react-router-dom";
import { useFiles } from "../Context/FileContext";
import { useEffect } from "react";
import { apiEndpoints } from "../Util/apiEndpoints";
import axiosConfig from "../Util/axiosConfig";

const Home = () => {
  const navigate = useNavigate();
  const [continueRead, setContinueRead] = useState(false);
  const { files, getProgress, selectFile } = useFiles();
  const [user, setUser] = useState(null);

  // for fetching the user details so that it displays the username
  useEffect(() => {
          const fetchUserProfile = async () => {
              try {
                  const { data } = await axiosConfig.get(apiEndpoints.USER_PROFILE);
                  setUser(data.user);
              } catch (error) {
                  console.error('Error fetching user profile:', error);
              }
          };
          fetchUserProfile();
      }, []);

  const openPdf = (file) => {
    selectFile(file);
    navigate(`/viewpdf/${file.id}`);
  };

  function filterBooks(books) {
    return books.filter((b) => b.currentPage > 0 && b.currentPage < b.numPages);
  }

  const filtered = filterBooks(files);

  return (
    <div className="pb-30">
      <div className="flex pt-13 pb-[26px] justify-between items-center px-[16px]">
        <div className="flex flex-row items-center">
          <span className="flex h-[46px] w-[46px] bg-[#d9d9d9] rounded-full justify-center">
            <img src="/profile.svg" alt="profile" className="w-[30px]" />
          </span>
          <span className="flex flex-col pl-1">
            <p className="text-tittle_Small font-medium xsm:text-[13px]">
              Welcome back
            </p>
            <p className="text-tittle_Large font-medium xsm:text-[18px]">
              {user ? user.username : "Reader"}
            </p>
          </span>
        </div>
        <div>
          <div className="w-fit h-[36px] bg-[#ff5800]/40 border-1 border-[#ff5b04] text-[#ff5b04] font-medium rounded-full flex justify-center items-center px-3 sm:px-[24px] xsm:text-[13px] opacity-80">
            7 day Reading streak{" "}
            <img src="/fire.svg" alt="fire" className="w-[24px] xsm:w-[16px]" />
          </div>
        </div>
      </div>

      <div className="px-[16px] pb-[26px] xsm:text-[15px]">
        <div className="bg-primary min-h-[177px] rounded-[20px] relative overflow-hidden text-white px-[16px] py-[23px] flex flex-col justify-between">
          <span className="flex h-[100px] w-[100px] bg-white/20 rounded-full absolute left-72 top-[-30px]"></span>
          <span className="flex h-[100px] w-[100px] bg-white/20 rounded-full absolute top-30 left-[-40px]"></span>
          <div className="flex items-center">
            <img src="/Group2.svg" alt="asset" className="w-[20px] h-[20px]" />
            <p className="pl-2 font-medium">Daily Reading Goal</p>
          </div>
          <div className="flex flex-col">
            <span className="flex items-baseline-last">
              <p className="text-display_Medium leading-10">0</p>
              <p className="">/ 30 min</p>
            </span>
            <span className="w-full bg-[#cde1fe] h-[14px] flex rounded-full"></span>
          </div>
          <div>
            <p className="font-medium">30 minutes to reach your goal</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between px-[16px] pb-5">
        <div>
          <div className="bg-white w-[79px] h-[80px] rounded-[15.89px] flex flex-col justify-center items-center">
            <div
              className="bg-primary rounded-[8.45px] w-[42px] h-[42.53px] flex justify-center active:bg-primary/80"
              onClick={() => {
                navigate("/library");
              }}
            >
              <img src="/library_books.svg" className="w-[24px]" />
            </div>
            <p className="text-[#4d4d4d] text-body_Small">Library</p>
          </div>
        </div>

        <div>
          <div className="bg-white w-[79px] h-[80px] rounded-[15.89px] flex flex-col justify-center items-center">
            <div
              className="bg-[#F59E0B] rounded-[8.45px] w-[42px] h-[42.53px] flex justify-center active:bg-[#F59E0B]/80"
              onClick={() => {
                navigate("/notes");
              }}
            >
              <img src="/note_stack.svg" className="w-[24px]" />
            </div>
            <p className="text-[#4d4d4d] text-body_Small">Notes</p>
          </div>
        </div>

        <div>
          <div className="bg-white w-[79px] h-[80px] rounded-[15.89px] flex flex-col justify-center items-center">
            <div className="bg-[#10B981] rounded-[8.45px] w-[42px] h-[42.53px] flex justify-center opacity-70">
              <img src="/lock_clock.svg" className="w-[24px]" />
            </div>
            <p className="text-[#4d4d4d] text-body_Small">Focus</p>
          </div>
        </div>

        <div>
          <div className="bg-white w-[79px] h-[80px] rounded-[15.89px] flex flex-col justify-center items-center">
            <div
              className="bg-[#A855F7] rounded-[8.45px] w-[42px] h-[42.53px] flex justify-center active:bg-[#A855F7]/80"
              onClick={() => {
                navigate("/explore");
              }}
            >
              <img src="/explore.svg" className="w-[24px]" />
            </div>
            <p className="text-[#4d4d4d] text-body_Small">Explore</p>
          </div>
        </div>
      </div>

      <div className="px-[16px] pb-10">
        <div className="bg-[#fff] px-[16px] min-h-[133px] rounded-[20px] py-[20px] flex flex-col justify-between">
          <p className="text-tittle_Small text-[#5f5f61]">Daily Inspiration</p>
          <p className="text-black font-medium text-[14px] leading-4">
            “Reading is essential for those who seek to rise above the ordinary”
          </p>
          <p className="text-primary text-tittle_Small">- Jim John</p>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="px-4">
          <div className="font-medium mb-5">Continue Reading</div>
          {filtered.map((file) => (
            <ContCard
              key={file.id}
              fileName={file.name}
              page={file.currentPage || 0}
              totalPage={
                file.type === "pdf"
                  ? file.numPages || 0
                  : file.metadata?.totalPages
              }
              progress={getProgress(file)}
              onOpen={() => {
                file.type === "pdf" ? openPdf(file) : openEpub(file);
              }}
              progPercent={getProgress(file) + "%"}
              continueRead={
                file.currentPage < 1 ? "Start Reading" : "Continue Reading"
              }
              coverImage={file.coverImage}
              file={file}
            />
          ))}
        </div>
      ) : (
        <div className="flex px-4 pt-5 justify-center flex-col text-center">
          <p>Nothing here for now...try reading some books</p>
          <p className="mt-2">
            Go to{" "}
            <a href="/library" className="underline text-primary">
              Library
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
