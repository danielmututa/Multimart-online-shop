import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateBlog, GetBlogById, UpdateBlog } from '@/api';
import { BlogPostSM } from '@/components/interfaces/blog';

interface BlogsProps {
  onBlogAction?: () => void;
}

interface BlogImage {
  image_url: string;
}

interface ImageFiles {
  image_url?: File;
  hero_image?: File;
  blog_image_one?: File;
  blog_image_two?: File;
  blog_image_three?: File;
  author_avatar?: File;
  annotation_image_one?: File;
  annotation_image_two?: File;
  annotation_image_three?: File;
  annotation_image_four?: File;
  annotation_image_five?: File;
  meta_og_image?: File;
  blog_images: File[];
}

const Blogs: React.FC<BlogsProps> = ({ onBlogAction }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<BlogPostSM>>({
    title: '',
    description: '',
    content: '',
    image_url: '',
    hero_image: '',
    blog_image_one: '',
    blog_image_two: '',
    blog_image_three: '',
    author_avatar: '',
    epigraph: '',
    first_paragraph: '',
    second_paragraph: '',
    third_paragraph: '',
    fourth_paragraph: '',
    fifth_paragraph: '',
    annotation_image_one: '',
    annotation_image_two: '',
    annotation_image_three: '',
    annotation_image_four: '',
    annotation_image_five: '',
    point_one_title: '',
    point_one_description: '',
    point_two_title: '',
    point_two_description: '',
    point_three_title: '',
    point_three_description: '',
    point_four_title: '',
    point_four_description: '',
    point_five_title: '',
    point_five_description: '',
    categories: '',
    more_blogs: '',
    meta_description: '',
    keywords: '',
    meta_author: '',
    meta_og_title: '',
    meta_og_url: '',
    meta_og_image: '',
    meta_site_name: '',
    meta_post_twitter: '',
    status: 'visible',
    // blog_images: [],
  });
  const [imageFiles, setImageFiles] = useState<ImageFiles>({ blog_images: [] });
  const [imagePreview, setImagePreview] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    success: false,
  });

  // Fetch blog data for editing
  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const blog = await GetBlogById(id);
          setFormData({
            ...blog,
            categories: blog.categories || '',
            blog_images: blog.blog_images || [],
          });
        } catch (error: any) {
          if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
            setSubmitStatus({
              loading: false,
              error: 'Blog not found.',
              success: false,
            });
          } else {
            setSubmitStatus({
              loading: false,
              error: 'Failed to load blog. Please try again.',
              success: false,
            });
          }
        }
      };
      fetchBlog();
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    isBlogImage: boolean = false
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (isBlogImage) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => ({
        ...prev,
        // blog_images: [...prev.blog_images, ...newFiles],
      }));
      newFiles.forEach((file, index) => {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview((prev) => ({
          ...prev,
          [`blog_images_${prev.blog_images?.length + index}`]: previewUrl,
        }));
      });
    } else {
      const file = files[0];
      setImageFiles((prev) => ({
        ...prev,
        [field]: file,
      }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview((prev) => ({
        ...prev,
        [field]: previewUrl,
      }));
    }
  };

 
  //   e.preventDefault();
  //   setSubmitStatus({ loading: true, error: null, success: false });

  //   const requiredFields = ['title', 'description', 'content', 'categories', 'status'];
  //   const missingFields = requiredFields.filter(
  //     (field) => !formData[field as keyof typeof formData]?.toString().trim()
  //   );

  //   if (missingFields.length > 0) {
  //     setSubmitStatus({
  //       loading: false,
  //       error: `Please fill in the following required fields: ${missingFields.join(', ')}`,
  //       success: false,
  //     });
  //     return;
  //   }

  //   try {
  //     const formDataToSend = new FormData();

  //     // Append text fields (exclude backend-generated fields)
  //     Object.entries(formData).forEach(([key, value]) => {
  //       if (
  //         key !== 'blog_images' &&
  //         key !== 'id' &&
  //         key !== 'created_at' &&
  //         key !== 'author_id' &&
  //         key !== 'blog_type_id' &&
  //         key !== 'meta_facebook_id' &&
  //         value &&
  //         value.toString().trim()
  //       ) {
  //         formDataToSend.append(key, value.toString());
  //       }
  //     });

  //     // Append image files
  //     Object.entries(imageFiles).forEach(([key, value]) => {
  //       if (value && key !== 'blog_images') {
  //         formDataToSend.append(key, value);
  //       }
  //     });

  //     // Append blog_images array
  //     imageFiles.blog_images.forEach((file, index) => {
  //       formDataToSend.append(`blog_images[${index}]`, file);
  //     });

  //     // Debugging: Log FormData contents
  //     console.log('FormData contents:');
  //     for (const [key, value] of formDataToSend.entries()) {
  //       console.log(`${key}: ${value}`);
  //     }

  //     const response = id
  //       ? await UpdateBlog(id, formDataToSend)
  //       : await CreateBlog(formDataToSend);

  //     // Debugging: Log the API response
  //     console.log('API Response:', response);

  //     // Relaxed validation: Check if response exists and seems valid
  //     if (!response || typeof response !== 'object') {
  //       throw new Error('Invalid response from server: empty or malformed response');
  //     }

  //     setSubmitStatus({ loading: false, error: null, success: true });

  //     // Reset form
  //     setFormData({
  //       title: '',
  //       description: '',
  //       content: '',
  //       image_url: '',
  //       hero_image: '',
  //       blog_image_one: '',
  //       blog_image_two: '',
  //       blog_image_three: '',
  //       author_avatar: '',
  //       epigraph: '',
  //       first_paragraph: '',
  //       second_paragraph: '',
  //       third_paragraph: '',
  //       fourth_paragraph: '',
  //       fifth_paragraph: '',
  //       annotation_image_one: '',
  //       annotation_image_two: '',
  //       annotation_image_three: '',
  //       annotation_image_four: '',
  //       annotation_image_five: '',
  //       point_one_title: '',
  //       point_one_description: '',
  //       point_two_title: '',
  //       point_two_description: '',
  //       point_three_title: '',
  //       point_three_description: '',
  //       point_four_title: '',
  //       point_four_description: '',
  //       point_five_title: '',
  //       point_five_description: '',
  //       categories: '',
  //       more_blogs: '',
  //       meta_description: '',
  //       keywords: '',
  //       meta_author: '',
  //       meta_og_title: '',
  //       meta_og_url: '',
  //       meta_og_image: '',
  //       meta_site_name: '',
  //       meta_post_twitter: '',
  //       status: 'visible',
  //       blog_images: [],
  //     });
  //     setImageFiles({ blog_images: [] });
  //     setImagePreview({});

  //     if (onBlogAction) onBlogAction();
  //     navigate('/');
  //   } catch (error) {
  //     console.error('Error submitting blog:', error);
  //     setSubmitStatus({
  //       loading: false,
  //       error: error instanceof Error ? error.message : 'An error occurred while submitting',
  //       success: false,
  //     });
  //   }
  // };


//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setSubmitStatus({ loading: true, error: null, success: false });

//   const requiredFields = ['title', 'description', 'content', 'categories', 'status'];
//   const missingFields = requiredFields.filter(
//     (field) => !formData[field as keyof typeof formData]?.toString().trim()
//   );

//   if (missingFields.length > 0) {
//     setSubmitStatus({
//       loading: false,
//       error: `Please fill in the following required fields: ${missingFields.join(', ')}`,
//       success: false,
//     });
//     return;
//   }

//   try {
//     const formDataToSend = new FormData();

//     // ✅ FIXED: Only append if value exists AND is not empty
//     Object.entries(formData).forEach(([key, value]) => {
//       if (
//         key !== 'blog_images' &&
//         key !== 'id' &&
//         key !== 'created_at' &&
//         key !== 'author_id' &&
//         key !== 'blog_type_id' &&
//         key !== 'meta_facebook_id' &&
//         value !== undefined &&
//         value !== null &&
//         value !== '' &&  // ✅ Add this check
//         (typeof value === 'string' ? value.trim() !== '' : true)
//       ) {
//         formDataToSend.append(key, value.toString());
//       }
//     });

//     // Append image files (only if they exist)
//     Object.entries(imageFiles).forEach(([key, value]) => {
//       if (value && key !== 'blog_images') {
//         formDataToSend.append(key, value);
//       }
//     });

//     // Append blog_images array
//     imageFiles.blog_images.forEach((file, index) => {
//       formDataToSend.append(`blog_images[${index}]`, file);
//     });

//     console.log('FormData contents:');
//     for (const [key, value] of formDataToSend.entries()) {
//       console.log(`${key}:`, value);
//     }

//     const response = id
//       ? await UpdateBlog(id, formDataToSend)
//       : await CreateBlog(formDataToSend);

//     if (!response || typeof response !== 'object') {
//       throw new Error('Invalid response from server');
//     }

//     setSubmitStatus({ loading: false, error: null, success: true });
    
//     // Reset form...
//     if (onBlogAction) onBlogAction();
//     navigate('/');

//   } catch (error) {
//     console.error('Error submitting blog:', error);
//     setSubmitStatus({
//       loading: false,
//       error: error instanceof Error ? error.message : 'An error occurred while submitting',
//       success: false,
//     });
//   }
// };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitStatus({ loading: true, error: null, success: false });

  try {
    const formDataToSend = new FormData();

    // ✅ FIXED: Only append TEXT fields (not image URLs)
    Object.entries(formData).forEach(([key, value]) => {
      // List of image fields to SKIP
      const imageFields = [
        'image_url', 'hero_image', 'blog_image_one', 'blog_image_two', 
        'blog_image_three', 'author_avatar', 'annotation_image_one', 
        'annotation_image_two', 'annotation_image_three', 
        'annotation_image_four', 'annotation_image_five', 'meta_og_image'
      ];
      
      if (
        !imageFields.includes(key) &&  // ✅ Skip image fields entirely
        key !== 'blog_images' &&
        key !== 'id' &&
        key !== 'created_at' &&
        key !== 'author_id' &&
        key !== 'blog_type_id' &&
        key !== 'meta_facebook_id' &&
        value !== undefined &&
        value !== null &&
        value !== '' &&
        (typeof value === 'string' ? value.trim() !== '' : true)
      ) {
        formDataToSend.append(key, value.toString());
      }
    });

    // ✅ Only append FILE objects
    Object.entries(imageFiles).forEach(([key, value]) => {
      if (value && key !== 'blog_images') {
        formDataToSend.append(key, value);
      }
    });

    // Append blog_images array
    // imageFiles.blog_images.forEach((file, index) => {
    //   formDataToSend.append(`blog_images[${index}]`, file);
    // });

    console.log('📦 FormData contents:');
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    const response = id
      ? await UpdateBlog(id, formDataToSend)
      : await CreateBlog(formDataToSend);

    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response from server');
    }

    setSubmitStatus({ loading: false, error: null, success: true });
    
    // Reset form
    setFormData({ /* your reset code */ });
    // setImageFiles({ blog_images: [] });
    setImagePreview({});
    
    if (onBlogAction) onBlogAction();
    navigate('/');

  } catch (error) {
    console.error('Error submitting blog:', error);
    setSubmitStatus({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred',
      success: false,
    });
  }
};

  return (
    <div className="w-full py-5 lg:py-10">
      <h2 className="text-lg lg:text-2xl font-medium mb-4">{id ? 'Edit Blog' : 'Create New Blog'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {/* Image Uploads with Previews */}
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-">
            Image URL - Carousel Image (1)
          </label>
          {(formData.image_url || imagePreview.image_url) && (
            <div className="mb-2">
              <img
                src={imagePreview.image_url || formData.image_url}
                alt="Image URL"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="image_url"
            name="image_url"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'image_url')}
          />
        </div>
        <div>
          <label htmlFor="hero_image" className="block text-sm font-medium">
            Hero Image - Carousel image (2)
          </label>
          {(formData.hero_image || imagePreview.hero_image) && (
            <div className="mb-2">
              <img
                src={imagePreview.hero_image || formData.hero_image}
                alt="Hero Image"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="hero_image"
            name="hero_image"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'hero_image')}
          />
        </div>
        <div>
          <label htmlFor="blog_image_one" className="block text-sm font-medium">
            Blog Image 1 Carousel Image (3)
          </label>
          {(formData.blog_image_one || imagePreview.blog_image_one) && (
            <div className="mb-2">
              <img
                src={imagePreview.blog_image_one || formData.blog_image_one}
                alt="Blog Image 1"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="blog_image_one"
            name="blog_image_one"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'blog_image_one')}
          />
        </div>
        <div>
          <label htmlFor="blog_image_two" className="block text-sm font-medium">
           Blog Image 2 Carousel Image (4)
          </label>
          {(formData.blog_image_two || imagePreview.blog_image_two) && (
            <div className="mb-2">
              <img
                src={imagePreview.blog_image_two || formData.blog_image_two}
                alt="Blog Image 2"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="blog_image_two"
            name="blog_image_two"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'blog_image_two')}
          />
        </div>
        <div>
          <label htmlFor="blog_image_three" className="block text-sm font-medium">
            Blog Image 3 Carousel Image (5)
          </label>
          {(formData.blog_image_three || imagePreview.blog_image_three) && (
            <div className="mb-2">
              <img
                src={imagePreview.blog_image_three || formData.blog_image_three}
                alt="Blog Image 3"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="blog_image_three"
            name="blog_image_three"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'blog_image_three')}
          />
        </div>
        <div>
          <label htmlFor="author_avatar" className="block text-sm font-medium">
            Author - Auth Blog / Company logo
          </label>
          {(formData.author_avatar || imagePreview.author_avatar) && (
            <div className="mb-2">
              <img
                src={imagePreview.author_avatar || formData.author_avatar}
                alt="Author Avatar"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="author_avatar"
            name="author_avatar"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'author_avatar')}
          />
        </div>
        <div>
          <label htmlFor="annotation_image_one" className="block text-sm font-medium">
            Annotation Image Blog (1) 
          </label>
          {(formData.annotation_image_one || imagePreview.annotation_image_one) && (
            <div className="mb-2">
              <img
                src={imagePreview.annotation_image_one || formData.annotation_image_one}
                alt="Annotation Image 1"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="annotation_image_one"
            name="annotation_image_one"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'annotation_image_one')}
          />
        </div>
        <div>
          <label htmlFor="annotation_image_two" className="block text-sm font-medium">
            Annotation Image Blog (2)
          </label>
          {(formData.annotation_image_two || imagePreview.annotation_image_two) && (
            <div className="mb-2">
              <img
                src={imagePreview.annotation_image_two || formData.annotation_image_two}
                alt="Annotation Image 2"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="annotation_image_two"
            name="annotation_image_two"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'annotation_image_two')}
          />
        </div>
        <div>
          <label htmlFor="annotation_image_three" className="block text-sm font-medium">
            Annotation Image  3 (Optional)
          </label>
          {(formData.annotation_image_three || imagePreview.annotation_image_three) && (
            <div className="mb-2">
              <img
                src={imagePreview.annotation_image_three || formData.annotation_image_three}
                alt="Annotation Image 3"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="annotation_image_three"
            name="annotation_image_three"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'annotation_image_three')}
          />
        </div>
        <div>
          <label htmlFor="annotation_image_four" className="block text-sm font-medium">
            Annotation Image 4 (Optional)
          </label>
          {(formData.annotation_image_four || imagePreview.annotation_image_four) && (
            <div className="mb-2">
              <img
                src={imagePreview.annotation_image_four || formData.annotation_image_four}
                alt="Annotation Image 4"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="annotation_image_four"
            name="annotation_image_four"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'annotation_image_four')}
          />
        </div>
        <div>
          <label htmlFor="annotation_image_five" className="block text-sm font-medium">
            Annotation Image 5 (Optional)
          </label>
          {(formData.annotation_image_five || imagePreview.annotation_image_five) && (
            <div className="mb-2">
              <img
                src={imagePreview.annotation_image_five || formData.annotation_image_five}
                alt="Annotation Image 5"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="annotation_image_five"
            name="annotation_image_five"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'annotation_image_five')}
          />
        </div>
        <div>
          <label htmlFor="meta_og_image" className="block text-sm font-medium">
            Meta OG Image (Optional)
          </label>
          {(formData.meta_og_image || imagePreview.meta_og_image) && (
            <div className="mb-2">
              <img
                src={imagePreview.meta_og_image || formData.meta_og_image}
                alt="Meta OG Image"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <Input
            id="meta_og_image"
            name="meta_og_image"
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => handleFileChange(e, 'meta_og_image')}
          />
        </div>
        <div>
          <label htmlFor="blog_images" className="block text-sm font-medium">
            Additional Blog Images (Optional)
          </label>
          <div className="mb-2 flex flex-wrap gap-2">
            {formData.blog_images &&
              formData.blog_images.length > 0 &&
              formData.blog_images.map((image: BlogImage, index: number) => (
                <img
                  key={`existing-${index}`}
                  src={image.image_url}
                  alt={`Blog Image ${index + 1}`}
                  className="w-32 h-32 object-cover"
                />
              ))}
            {Object.entries(imagePreview)
              .filter(([key]) => key.startsWith('blog_images_'))
              .map(([key, url]) => (
                <img
                  key={key}
                  src={url}
                  alt="New Blog Image"
                  className="w-32 h-32 object-cover"
                />
              ))}
          </div>
          <Input
            id="blog_images"
            name="blog_images"
            type="file"
            accept="image/*"
            multiple
            className="w-full"
            onChange={(e) => handleFileChange(e, 'blog_images', true)}
          />
        </div>

        {/* Text Fields */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title *
          </label>
          <Input
            id="title"
            name="title"
            className="w-full"
            placeholder="Enter blog title"
            value={formData.title || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description  one only *
          </label>
          <Input
            id="description"
            name="description"
            className="w-full"
            placeholder="Enter blog description"
            value={formData.description || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium">
            Content one one only *
          </label>
          <textarea
            id="content"
            name="content"
            className="w-full p-2 border rounded-md"
            placeholder="Enter blog content"
            value={formData.content || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="epigraph" className="block text-sm font-medium">
            Epigraph blog first
          </label>
          <Input
            id="epigraph"
            name="epigraph"
            className="w-full"
            placeholder="Enter epigraph"
            value={formData.epigraph || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="first_paragraph" className="block text-sm font-medium">
            First Paragraph (Optional)
          </label>
          <textarea
            id="first_paragraph"
            name="first_paragraph"
            className="w-full p-2 border rounded-md"
            placeholder="Enter first paragraph"
            value={formData.first_paragraph || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="second_paragraph" className="block text-sm font-medium">
            Second Paragraph (Optional)
          </label>
          <textarea
            id="second_paragraph"
            name="second_paragraph"
            className="w-full p-2 border rounded-md"
            placeholder="Enter second paragraph"
            value={formData.second_paragraph || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="third_paragraph" className="block text-sm font-medium">
            Third Paragraph (Optional)
          </label>
          <textarea
            id="third_paragraph"
            name="third_paragraph"
            className="w-full p-2 border rounded-md"
            placeholder="Enter third paragraph"
            value={formData.third_paragraph || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="fourth_paragraph" className="block text-sm font-medium">
            Fourth Paragraph (Optional)
          </label>
          <textarea
            id="fourth_paragraph"
            name="fourth_paragraph"
            className="w-full p-2 border rounded-md"
            placeholder="Enter fourth paragraph"
            value={formData.fourth_paragraph || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="fifth_paragraph" className="block text-sm font-medium">
            Fifth Paragraph (Optional)
          </label>
          <textarea
            id="fifth_paragraph"
            name="fifth_paragraph"
            className="w-full p-2 border rounded-md"
            placeholder="Enter fifth paragraph"
            value={formData.fifth_paragraph || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_one_title" className="block text-sm font-medium">
            Point 1 Title (Optional)
          </label>
          <Input
            id="point_one_title"
            name="point_one_title"
            className="w-full"
            placeholder="Enter point 1 title"
            value={formData.point_one_title || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_one_description" className="block text-sm font-medium">
            Point 1 Description (Optional)
          </label>
          <Input
            id="point_one_description"
            name="point_one_description"
            className="w-full"
            placeholder="Enter point 1 description"
            value={formData.point_one_description || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_two_title" className="block text-sm font-medium">
            Point 2 Title (Optional)
          </label>
          <Input
            id="point_two_title"
            name="point_two_title"
            className="w-full"
            placeholder="Enter point 2 title"
            value={formData.point_two_title || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_two_description" className="block text-sm font-medium">
            Point 2 Description (Optional)
          </label>
          <Input
            id="point_two_description"
            name="point_two_description"
            className="w-full"
            placeholder="Enter point 2 description"
            value={formData.point_two_description || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_three_title" className="block text-sm font-medium">
            Point 3 Title (Optional)
          </label>
          <Input
            id="point_three_title"
            name="point_three_title"
            className="w-full"
            placeholder="Enter point 3 title"
            value={formData.point_three_title || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_three_description" className="block text-sm font-medium">
            Point 3 Description (Optional)
          </label>
          <Input
            id="point_three_description"
            name="point_three_description"
            className="w-full"
            placeholder="Enter point 3 description"
            value={formData.point_three_description || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_four_title" className="block text-sm font-medium">
            Point 4 Title (Optional)
          </label>
          <Input
            id="point_four_title"
            name="point_four_title"
            className="w-full"
            placeholder="Enter point 4 title"
            value={formData.point_four_title || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_four_description" className="block text-sm font-medium">
            Point 4 Description (Optional)
          </label>
          <Input
            id="point_four_description"
            name="point_four_description"
            className="w-full"
            placeholder="Enter point 4 description"
            value={formData.point_four_description || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_five_title" className="block text-sm font-medium">
            Point 5 Title (Optional)
          </label>
          <Input
            id="point_five_title"
            name="point_five_title"
            className="w-full"
            placeholder="Enter point 5 title"
            value={formData.point_five_title || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="point_five_description" className="block text-sm font-medium">
            Point 5 Description (Optional)
          </label>
          <Input
            id="point_five_description"
            name="point_five_description"
            className="w-full"
            placeholder="Enter point 5 description"
            value={formData.point_five_description || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="meta_description" className="block text-sm font-medium">
            Meta Description (Optional)
          </label>
          <Input
            id="meta_description"
            name="meta_description"
            className="w-full"
            placeholder="Enter meta description"
            value={formData.meta_description || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium">
            Keywords (Optional)
          </label>
          <Input
            id="keywords"
            name="keywords"
            className="w-full"
            placeholder="Enter keywords (e.g., api, rest)"
            value={formData.keywords || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="meta_author" className="block text-sm font-medium">
            Meta Author (Optional)
          </label>
          <Input
            id="meta_author"
            name="meta_author"
            className="w-full"
            placeholder="Enter meta author"
            value={formData.meta_author || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="meta_og_title" className="block text-sm font-medium">
            Meta OG Title (Optional)
          </label>
          <Input
            id="meta_og_title"
            name="meta_og_title"
            className="w-full"
            placeholder="Enter meta OG title"
            value={formData.meta_og_title || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="meta_og_url" className="block text-sm font-medium">
            Meta OG URL (Optional)
          </label>
          <Input
            id="meta_og_url"
            name="meta_og_url"
            className="w-full"
            placeholder="Enter meta OG URL"
            value={formData.meta_og_url || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="meta_site_name" className="block text-sm font-medium">
            Meta Site Name (Optional)
          </label>
          <Input
            id="meta_site_name"
            name="meta_site_name"
            className="w-full"
            placeholder="Enter meta site name"
            value={formData.meta_site_name || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="meta_post_twitter" className="block text-sm font-medium">
            Meta Post Twitter (Optional)
          </label>
          <Input
            id="meta_post_twitter"
            name="meta_post_twitter"
            className="w-full"
            placeholder="Enter meta post Twitter"
            value={formData.meta_post_twitter || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="more_blogs" className="block text-sm font-medium">
            More Blogs (Optional)
          </label>
          <Input
            id="more_blogs"
            name="more_blogs"
            className="w-full"
            placeholder="Enter more blogs"
            value={formData.more_blogs || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="categories" className="block text-sm font-medium">
            Category *
          </label>
          <Input
            id="categories"
            name="categories"
            className="w-full"
            placeholder="Enter category (e.g., Technology, Programming)"
            value={formData.categories || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            Status *
          </label>
          <Select
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                status: value as 'visible' | 'draft' | 'archived',
              }))
            }
            value={formData.status || 'visible'}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <div>
          <Button type="submit" disabled={submitStatus.loading} className="w-full">
            {submitStatus.loading ? 'Submitting...' : id ? 'Update Blog' : 'Create Blog'}
          </Button>
        </div>

        {/* Status Messages */}
        {submitStatus.error && <p className="text-red-500 text-sm">{submitStatus.error}</p>}
        {submitStatus.success && (
          <p className="text-green-500 text-sm">
            {id ? 'Blog updated' : 'Blog created'} successfully!
          </p>
        )}
      </form>
    </div>
  );
};

export default Blogs;










