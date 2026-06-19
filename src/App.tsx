import { useEffect, useRef, useState } from "react";
import Add from "./add";

type ImageLocal = {
  image: string;
  createdAt: number;
};

function App() {
  const [addMenu, setAddMenu] = useState<boolean>(false);
  const [storyMenu, setStoryMenu] = useState<boolean>(false);
  const [index, setIndex] = useState<number | null>(null);
  const [images, setImages] = useState<ImageLocal[]>([]);
  const [notSeen, setNotSeen] = useState<number[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent) => {
    if (!imgRef.current || index == null) return;
    const rect = imgRef.current.getBoundingClientRect();

    const clickX = event.clientX - rect.left;
    const width = rect.width;

    if (clickX > width * 0.75) {
      if (notSeen.indexOf(index) + 1 >= notSeen.length) {
        setStoryMenu(false);
      } else {
        setProgress(0);
        setIndex(notSeen[notSeen.indexOf(index) + 1]);
      }
    } else if (clickX < width * 0.25) {
      if (notSeen.indexOf(index) - 1 > -1) {
        setIndex(notSeen[notSeen.indexOf(index) - 1]);
      }
    }
  };

  const touchStart = (event: React.TouchEvent) => {
    touchStartY.current = event.touches[0].clientY;
  };

  const touchEnd = (event: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const endY = event.changedTouches[0].clientY;
    const distance = endY - touchStartY.current;

    if (distance > 100) {
      setStoryMenu(false);
    }
    touchStartY.current = null;
  };

  const loadImages = () => {
    const oneDay = 24 * 60 * 60 * 1000;
    let storedImages: ImageLocal[] = JSON.parse(
      localStorage.getItem("images") || "[]",
    );

    storedImages = storedImages.filter(
      (img) => Date.now() - img.createdAt < oneDay,
    );

    localStorage.setItem("images", JSON.stringify(storedImages));

    setImages(storedImages);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        storyRef.current &&
        !storyRef.current.contains(event.target as Node)
      ) {
        setStoryMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadImages();
  }, []);
  useEffect(() => {
    setNotSeen(images.map((_, index) => index));
    console.log(images);
  }, [images]);

  useEffect(() => {
    if (!storyMenu) return;
    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elasped = Date.now() - start;
      const percent = (elasped / 3000) * 100;

      if (percent >= 100) {
        setIndex((prev) => {
          if (prev == null) return prev;
          if (notSeen.indexOf(prev) + 1 >= notSeen.length) {
            setStoryMenu(false);
            return prev;
          }
          return notSeen[notSeen.indexOf(prev) + 1];
        });
      } else {
        setProgress(percent);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [storyMenu, index]);

  return (
    <div className="min-h-screen ">
      <div className="bg-gray-100 w-screen h-24 p-2 flex items-center gap-4 overflow-x-scroll">
        <button
          className="bg-white min-h-16 min-w-16 rounded-full hover:cursor-pointer border-gray-400 border flex items-center justify-center"
          onClick={() => setAddMenu((prev) => !prev)}
        >
          <h1 className="text-4xl">+</h1>
        </button>
        {images.map((img, index) => (
          <button
            key={index}
            className="h-16 w-16 p-1 hover:cursor-pointer rounded-full overflow-hidden bg-blue-400"
            onClick={() => {
              setIndex(index);
              setStoryMenu(true);
            }}
          >
            <img
              src={img.image}
              className="object-cover w-full h-full rounded-full"
            ></img>
          </button>
        ))}
      </div>
      {addMenu && <Add setAddMenu={setAddMenu} loadImages={loadImages}></Add>}
      {storyMenu && (
        <div className="inset-0 fixed bg-black/90 border flex justify-center items-center">
          <div
            className="h-screen md:w-1/2 bg-black w-full"
            ref={storyRef}
            onTouchStart={touchStart}
            onTouchEnd={touchEnd}
          >
            <div className="h-6 flex items-center justify-center border p-1 gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-full bg-gray-700 rounded-md overflow-hidden"
                >
                  {i === index && (
                    <div
                      className="h-full bg-white"
                      style={{ width: `${progress}%` }}
                    />
                  )}

                  {i < index && <div className="h-full w-full bg-white" />}
                </div>
              ))}
            </div>
            <div
              className="flex flex-col h-full justify-center"
              ref={imgRef}
              onClick={handleClick}
            >
              <img src={images[index].image}></img>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
