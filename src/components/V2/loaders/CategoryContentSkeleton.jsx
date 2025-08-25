export default function CategoryContentSkeleton() {
  return (
    <div className="">
      <div className="">
        <div className=""></div>
        <div className=" "></div>
        <div className=" "></div>
      </div>

      <div className="">
        <div className="">
          {/* Generate 6 skeleton cards */}
          {[...Array(6)].map((_, index) => (
            <div key={index} className="">
              <div className=""></div>
              <div className=""></div>
              <div className="">
                <div className=" "></div>
                <div className="">
                  <div className=" "></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
