export default function CategorySkeleton() {
  return (
    <div className="">
      <div className="">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="">
            <div className=" "></div>
            <div className="">
              <div className=" "></div>
              <div className=" "></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
