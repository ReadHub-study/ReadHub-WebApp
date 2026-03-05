import React, { useState } from "react";

const Notes = () => {
  const [notes, setNotes] = useState(false);
  return (
    <div>
      <div className="px-[16px] pt-[40px] overflow-hidden mb-15">
        <div className="flex justify-between mb-8 items-center">
          <p className="text-black text-tittle_Large">Highlights & Notes</p>
          <span className="flex w-[40px] h-[40px] rounded-[8.04] bg-white opacity-0"></span>
        </div>

        <div className="bg-white h-[46px] w-full flex rounded-[11px] mb-4">
          <img src="/Variant3.svg" alt="search" className="w-[24px] mx-4" />
          <input
            type="text"
            placeholder="Search highlights..."
            className="outline-0 w-full"
            style={{ backgroundColor: "white", border: "0px" }}
          />
        </div>

        <div className="flex justify-between text-body_Small font-medium mb-4">
          <div className="h-[38px] w-[171px] xsm:w-[160px] border-1 rounded-[33px] border-[#4b6481] flex justify-center items-center">
            <img src="/Variant3c.svg" alt="icon" className="w-[24px]" />
            <p>AI Summary</p>
          </div>
          <div className="h-[38px] w-[171px] xsm:w-[160px] border-1 rounded-[33px] border-[#4b6481] flex justify-center items-center">
            <img src="/Variant3b.svg" alt="icon" className="w-[24px]" />
            <p>Create Blog Post</p>
          </div>
        </div>

        {notes ? (
          <div>
            {" "}
            <div className="flex justify-between mb-8">
              <div className="w-[171px] h-[72px] bg-white px-4 justify-center flex flex-col rounded-[13.96px]">
                <p className="text-primary text-headline_Small leading-7">3</p>
                <p className="text-tertiary text-body_Small">
                  Total highlights
                </p>
              </div>

              <div className="w-[171px] h-[72px] bg-white px-4 justify-center flex flex-col rounded-[13.96px]">
                <p className="text-primary text-headline_Small leading-7">2</p>
                <p className="text-tertiary text-body_Small">Books</p>
              </div>
            </div>
            <div>
              <span className="text-black text-tittle_Medium font-semibold flex mb-3">
                <img src="/import_contacts.svg" alt="" />
                <p className="ml-1">Atomic Habits</p>
              </span>

              <div>
                <div className="h-[97px] w-full bg-primary rounded-[10px] relative overflow-hidden border-0 outline-0 mb-8">
                  <div className="h-[97px] bg-white rounded-[10px] relative left-2 flex flex-col justify-center px-2">
                    <p className=" text-body_Medium font-medium">
                      “You do not rise to the level of your goals. You fall to
                      the level of your systems.”
                    </p>
                    <p className="text-[#5f5f61] text-body_Small mt-1">
                      Page 27
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="h-[97px] w-full bg-primary rounded-[10px] relative overflow-hidden border-0 outline-0 mb-8">
                  <div className="h-[97px] bg-white rounded-[10px] relative left-2 flex flex-col justify-center px-2">
                    <p className=" text-body_Medium font-medium">
                      “You do not rise to the level of your goals. You fall to
                      the level of your systems.”
                    </p>
                    <p className="text-[#5f5f61] text-body_Small mt-1">
                      Page 27
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-black text-tittle_Medium font-semibold flex mb-3">
                <img src="/import_contacts.svg" alt="" />
                <p className="ml-1">Deep Work</p>
              </span>

              <div>
                <div className="h-[97px] w-full bg-primary rounded-[10px] relative overflow-hidden border-0 outline-0 mb-8">
                  <div className="h-[97px] bg-white rounded-[10px] relative left-2 flex flex-col justify-center px-2">
                    <p className=" text-body_Medium font-medium">
                      “You do not rise to the level of your goals. You fall to
                      the level of your systems.”
                    </p>
                    <p className="text-[#5f5f61] text-body_Small mt-1">
                      Page 27
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="h-[97px] w-full bg-primary rounded-[10px] relative overflow-hidden border-0 outline-0 mb-8">
                  <div className="h-[97px] bg-white rounded-[10px] relative left-2 flex flex-col justify-center px-2">
                    <p className=" text-body_Medium font-medium">
                      “You do not rise to the level of your goals. You fall to
                      the level of your systems.”
                    </p>
                    <p className="text-[#5f5f61] text-body_Small mt-1">
                      Page 27
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center h-100 items-center">
            Cultivate a habit of taking notes
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
