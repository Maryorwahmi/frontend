import { useNavigate } from 'react-router-dom';
import { useAsyncResource } from '@/shared/api/live';
import { coursesAPI } from '@/shared/api/client';

export const CourseCatalog = ({ featured = true }: { featured?: boolean }) => {
  const navigate = useNavigate();
  const { data } = useAsyncResource(() => coursesAPI.listCourses(), []);
  const courses = data || [];
  const list = featured ? courses.slice(0, 3) : courses;

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {list.map((c: any) => (
            <div key={c.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="h-40 w-full rounded-md mb-4 bg-gradient-to-br from-[#07107b] via-[#18308f] to-[#f08a2c]" />
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-gray-600 mb-4">{c.description}</p>
              <button
                onClick={() => navigate(`/catalog/${c.id}`)}
                className="bg-[#000066] text-white px-4 py-2 rounded-lg hover:bg-[#000044]"
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseCatalog;
