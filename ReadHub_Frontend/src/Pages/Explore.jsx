import React, { useState } from "react";
import { ReadHubImages } from "../assets/asset";
import { useNavigate } from "react-router-dom";
import { LuSearch } from "react-icons/lu";
import { IoClose } from "react-icons/io5";

const Explore = () => {
  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Search books</h3>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close search modal"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search new books..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-5 lg:py-5 lg:px-10 min-h-screen bg-gray-100">
        <div className="flex flex-col gap-1 justify-start items-start mt-10">
          <span className="text-3xl font-semibold">Explore</span>
          <span className="text-sm font-normal text-gray-600">
            Discover new reads and tips
          </span>
        </div>

        <div className="card flex flex-col gap-4 bg-blue-500 rounded-3xl p-5 mt-7.5">
          <div className="flex justify-start items-start">
            <img src={ReadHubImages.sparkleIcon} alt="icon" />
          </div>
          <div className="px-4">
            <span className="text-white text-lg">
              “The more that you read, the more things you will know. The more
              that you learn, the more places you’ll go.”
            </span>
          </div>
          <div>
            <span className="text-gray-100 text-sm">_Dr Seuss</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-7.5">
          <div className="flex flex-col gap-1.5 items-center justify-center bg-blue-200 rounded-2xl p-6">
            <span>
              <img src={ReadHubImages.timerIcon} alt="books" />
            </span>
            <span className="text-blue-600 text-sm">Start Focus</span>
          </div>
          <div
            className="flex flex-col gap-1.5 items-center justify-center bg-blue-200 rounded-2xl p-6 active:bg-blue-200/80"
            onClick={() => {
              navigate("/library");
            }}
          >
            <span>
              <img src={ReadHubImages.libraryIcon} alt="icon" />
            </span>
            <span className="text-blue-600">My Library</span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3.5 mt-12 w-full">
          <div className="flex flex-row justify-between items-center px-2">
            <span className="text-xl font-medium">Trending Books</span>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="text-2xl text-blue-600"
              aria-label="Open search"
            >
              <LuSearch />
            </button>
          </div>
          <div className="cards grid grid-cols-3 justify-center gap-8 items-center w-full">
            <div>
              <img src={ReadHubImages.trendingbook1} alt="books" />
            </div>
            <div>
              <img src={ReadHubImages.trendingbook2} alt="books" />
            </div>
            <div>
              <img src={ReadHubImages.trendingbook3} alt="books" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 justify-start items-start mt-9.5 lg:mt-14">
          <div>
            <span></span>
            <span className="text-lg font-medium">Reading Tips</span>
          </div>
          <div className="cards flex flex-col gap-5 items-start justify-start w-full">
            <div className="card bg-white w-full p-4 rounded-xl flex justify-start items-start flex-row gap-4 border-gray-200 border">
              <div className="p-3 rounded-lg flex justify-center items-center bg-blue-100">
                <span>
                  <img src={ReadHubImages.timerIcon} alt="icon" />
                </span>
              </div>
              <div className="flex flex-col gap-0.5 justify-start items-start">
                <span className="text-lg font-medium text-gray-800">
                  Set a Reading Schedule
                </span>
                <span className="text-sm font-normal text-gray-500">
                  Read at the same time everyday to a build a habit
                </span>
              </div>
            </div>
            <div className="card bg-white w-full p-4 rounded-xl flex justify-start items-start flex-row gap-4 border-gray-200 border">
              <div className="p-3 rounded-lg flex justify-center items-center bg-blue-100">
                <span>
                  <img src={ReadHubImages.blueCirclesIcon} alt="icon" />
                </span>
              </div>
              <div className="flex flex-col gap-0.5 justify-start items-start">
                <span className="text-lg font-medium text-gray-800">Set Daily Goals</span>
                <span className="text-sm font-normal text-gray-500">
                  Start with 20minutes and gradually increase
                </span>
              </div>
            </div>
            <div className="card bg-white w-full p-4 rounded-xl flex justify-start items-start flex-row gap-4 border-gray-200 border mb-20">
              <div className="p-3 rounded-lg flex justify-center items-center bg-blue-200">
                <span>
                  <img src={ReadHubImages.blueFlashIcon} alt="icon" />
                </span>
              </div>
              <div className="flex flex-col gap-0.5 justify-start items-start">
                <span className="text-lg font-medium text-gray-800">Use Focus Mode</span>
                <span className="text-sm font-normal text-gray-500">
                  Eliminate distraction with our readlock feature
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-7.5">
          <div></div>
          <div className="cards"></div>
        </div>
      </div>
    </>
  );
};

export default Explore;
