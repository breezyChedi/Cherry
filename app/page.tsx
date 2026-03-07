'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GooglePlayButton, AppStoreButton, AppGalleryButton } from 'react-mobile-app-button';
import {
  Calculator,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Utensils,
  Droplet,
  TrendingUp,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

// Proper cloud decoration component
const CloudDecoration = ({ className }: { className?: string }) => (
  <svg className={className} width="200" height="100" viewBox="0 0 200 100" fill="none">
    <path
      d="M 20,60 Q 20,40 35,35 Q 40,20 60,20 Q 80,20 85,35 Q 100,30 115,35 Q 130,35 140,45 Q 150,40 165,45 Q 180,50 180,65 Q 180,80 165,85 Q 150,85 140,80 L 35,80 Q 20,80 20,60 Z"
      fill="#FF69B4"
      opacity="0.25"
    />
  </svg>
);

// Device detection hook
function useDeviceDetection() {
  const [device, setDevice] = useState<'ios' | 'android' | 'huawei' | 'desktop'>('desktop');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDevice('ios');
    } else if (/huawei/i.test(userAgent)) {
      setDevice('huawei');
    } else if (/android/.test(userAgent)) {
      setDevice('android');
    } else {
      setDevice('desktop');
    }
  }, []);

  return device;
}

export default function HomePage() {
  const device = useDeviceDetection();

  const getAppStoreUrl = () => {
    switch (device) {
      case 'ios':
        return 'https://apps.apple.com/za/app/cherry-aps/id6743092423';
      case 'android':
        return 'https://play.google.com/store/apps/details?id=com.cherry.cherri';
      case 'huawei':
        return 'https://appgallery.huawei.com/app/C113682051';
      default:
        return '/profile';
    }
  };

  const handleMainButtonClick = (e: React.MouseEvent) => {
    if (device !== 'desktop') {
      e.preventDefault();
      window.location.href = getAppStoreUrl();
    }
  };
  return (
    <div style={{
      background: 'linear-gradient(180deg, #fddeff 0%, #ffe4f5 50%, #fddeff 100%)',
      width: '100%',
      margin: 0,
      padding: 0,
      position: 'relative'
    }}>
      {/* Fixed Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm px-6 py-4"
        style={{ backgroundColor: 'rgba(253, 222, 255, 0.9)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/cherryLogoPng.png"
                alt="Cherry Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-black text-black tracking-wider">CHERRY</span>
          </div>

          <a
            href={device === 'desktop' ? '/profile' : getAppStoreUrl()}
            onClick={handleMainButtonClick}
            className="bg-[#FF1493] text-white font-bold px-8 py-3 rounded-full hover:bg-pink-600 transition-all transform hover:scale-105 shadow-lg"
          >
            {device === 'desktop' ? 'Use Web App' : 'Download App'}
          </a>
        </div>
      </nav>

      {/* Decorative Clouds - REMOVED absolute positioned clouds that extend beyond content */}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <CloudDecoration className="absolute top-20 left-10 opacity-40" />
        <CloudDecoration className="absolute top-60 right-16 opacity-30" />
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-black mb-12 leading-tight"
            style={{ color: '#FF1493' }}
          >
            Pop the cherry<br />on something<br />new!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center mt-2 md:mt-16 -mx-4 md:mx-0"
          >
            <div className="relative w-full md:max-w-3xl aspect-[3/2] mx-auto transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/HOME_PHOTOS/IMG_3113.PNG"
                alt="Cherry App Preview"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Cherry Section */}
      <section className="py-20 px-6 relative">
        <CloudDecoration className="absolute top-10 right-10 opacity-40" />
        <CloudDecoration className="absolute bottom-10 left-12 opacity-35" />
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-12 shadow-xl"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF69B4' }}>
                <Lightbulb size={40} className="text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-black text-center mb-6">Cherry</h2>
            <p className="text-lg text-gray-800 mb-4 text-center">
              Cherry provides a platform for our users who want to search for university courses in South Africa. We understand that looking for the right course can be stressful and time consuming especially when there are so many websites.
            </p>
            <p className="text-lg text-gray-800 text-center">
              Our aim is to make it easier for both students and parents to search through course descriptions & requirements whilst knowing what their APS score is.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Educational Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <EducationalCard
            icon={<Calculator size={40} className="text-white" />}
            title="APS Score Points System"
            description="Admission Point Score is a measure of a student's academic performance based on their National Senior Certificate."
          />
          <EducationalCard
            icon={<BookOpen size={40} className="text-white" />}
            title="National Senior Certificate"
            description="The National Senior Certificate is a qualification awarded to students that pass grade 12 which is NQF Level 4."
          />
          <EducationalCard
            icon={<CheckCircle size={40} className="text-white" />}
            title="National Benchmark Test"
            description="The National Benchmark Test is a test used for first year applicants to assess their quantitative literacy and mathematics proficiency at an entry-level."
          />
        </div>
      </section>

      {/* Berry Informed */}
      <section className="py-20 px-6 relative">
        <CloudDecoration className="absolute top-20 left-5 opacity-30" />
        <CloudDecoration className="absolute bottom-10 right-24 opacity-30" />
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-8 inline-block">
              <div className="relative w-[300px] h-[400px]">
                <Image
                  src="/HOME_PHOTOS/42c0ffc0-0764-4f56-9ec6-0d975298381a.JPG"
                  alt="App Features"
                  fill
                  className="rounded-2xl object-cover shadow-2xl"
                />
              </div>
            </div>
            <h2 className="text-5xl font-black text-black mb-6">Berry Informed</h2>
            <p className="text-xl text-gray-800">
              Our Cherry App provides a detailed breakdown on NSC, NBTS and allows users to calculate their scores as many times as they like. Save your score and filter for the courses you qualify for.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Full Course Feast */}
      <section className="py-2 md:py-20 px-0 md:px-6">
        <div className="md:max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-4 md:gap-12 items-center"
          >
            <div className="relative w-full aspect-[3/2]">
              <Image
                src="/HOME_PHOTOS/IMG_3113.PNG"
                alt="University Explorer"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
            <div className="px-4 md:px-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF69B4' }}>
                  <Utensils size={32} className="text-white" />
                </div>
              </div>
              <h2 className="text-5xl font-black text-black mb-6">Full Course Feast</h2>
              <p className="text-xl text-gray-800 mb-4">
                Search for courses that suit you, from <span className="text-pink-500 font-bold">engineering, law to arts</span>. No need to spend hours on websites because <span className="text-pink-500 font-bold">you picked the sweet path</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sow Your Seeds */}
      <section className="py-2 md:py-20 px-0 md:px-6 relative">
        <CloudDecoration className="absolute top-10 right-20 opacity-30" />
        <CloudDecoration className="absolute bottom-10 left-1/4 opacity-35" />
        <div className="md:max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-4 md:gap-12 items-center"
          >
            <div className="order-2 md:order-1 px-4 md:px-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF69B4' }}>
                  <Droplet size={32} className="text-white" />
                </div>
              </div>
              <h2 className="text-5xl font-black text-black mb-6">Sow Your Seeds</h2>
              <p className="text-xl text-gray-800">
                <span className="text-pink-500 font-bold">Calculate your APS Score on the app.</span> With Cherry we help high school pupils & parents find courses the right courses for the future careers.
              </p>
            </div>
            <div className="relative w-full aspect-[3/2] order-1 md:order-2">
              <Image
                src="/HOME_PHOTOS/IMG_3112.PNG"
                alt="APS Calculator"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Record Your Marks */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF69B4' }}>
                <TrendingUp size={48} className="text-white" />
              </div>
            </div>
            <h2 className="text-5xl font-black text-black mb-6">Record your marks</h2>
            <div className="relative w-full max-w-md mx-auto h-[500px] mb-8">
              <Image
                src="/home1/photos_from_canva/record_marks_screenshot_processed.png"
                alt="Track Performance"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
            <p className="text-xl text-gray-800">
              <span className="text-pink-500 font-bold">Record</span> each term mark and <span className="text-pink-500 font-bold">monitor</span> your performance for each subject. Store the marks to check which marks you need for each course.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Meet the Co-Founders */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F8BBD0 0%, #E1BEE7 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-black text-black text-center mb-16 tracking-widest"
          >
            MEET THE CO-FOUNDERS
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <FounderCard
              name="Lebea Mpho Maake"
              imageSrc="/home1/photos_from_canva/lebea_photo.png"
              offsetY={0}
            />
            <FounderCard
              name="Tyrone Kasi"
              imageSrc="/home1/photos_from_canva/tyrone_photo.png"
              offsetY={18}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-pink-300 rounded-3xl p-10 border-4 border-black"
            >
              <h3 className="text-3xl font-bold text-pink-600 mb-6">About Us</h3>
              <p className="text-gray-900 mb-4">
                Cherry is a technology education t start-up founded by two University of Cape Town graduates passionate about transforming the mindset of secondary and tertiary education, as well as the workplace.
              </p>
              <p className="text-gray-900 mb-4">
                Established in 2024, our mission is to provide quick and accessible information to users—whether students, young professionals, schools, tertiary institutions, or companies—about education and the career aspirations.
              </p>
              <p className="text-gray-900">
                Cherry strives to become a household name, not just across the African continent but internationally. We will continue to add more universities, courses & more to inspire people worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md h-[400px]">
                <Image
                  src="/home1/photos_from_canva/africa_processed.png"
                  alt="Africa Map"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 px-6 relative">
        <CloudDecoration className="absolute top-10 left-10 opacity-40" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-8">
               <div className="relative w-[333px] h-[333px] transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                  <Image
                    src="/home1/photos_from_canva/hands_on_footer_processed.png"
                    alt="Get Cherry App"
                    fill
                    className="object-contain"
                  />
               </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
              The sweetest place to choose you courses,<br />
              <span className="text-pink-500">on our app</span>
            </h2>
            <p className="text-2xl text-gray-700 mb-8 italic">It&apos;s ripe for the download.</p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <div style={{ width: '200px', height: '60px' }}>
                <GooglePlayButton
                  url="https://play.google.com/store/apps/details?id=com.cherry.cherri"
                  theme="dark"
                  height={60}
                  width={200}
                />
              </div>
              <div style={{ width: '200px', height: '60px' }}>
                <AppStoreButton
                  url="https://apps.apple.com/za/app/cherry-aps/id6743092423"
                  theme="dark"
                  height={60}
                  width={200}
                />
              </div>
              <div style={{ width: '200px', height: '60px' }}>
                <AppGalleryButton
                  url="https://appgallery.huawei.com/app/C113682051"
                  theme="dark"
                  height={60}
                  width={200}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pt-20 pb-12 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-black mb-12">Contact us</h2>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">PHONE</h3>
            <a href="tel:+27682304410" className="inline-block bg-pink-500 text-black font-bold px-8 py-3 rounded-full mb-3 hover:bg-pink-600 transition-colors">
              (+27) 68 230 4410
            </a>
            <br />
            <a href="tel:+27769022130" className="inline-block bg-pink-500 text-black font-bold px-8 py-3 rounded-full hover:bg-pink-600 transition-colors">
              (+27) 76 902 2130
            </a>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">EMAIL</h3>
            <a href="mailto:info@cherry.org.za" className="inline-block bg-pink-500 text-black font-bold px-8 py-3 rounded-full hover:bg-pink-600 transition-colors">
              info@cherry.org.za
            </a>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">SOCIAL</h3>
            <div className="flex justify-center gap-4">
              <SocialIcon icon={<Twitter size={24} />} href="https://x.com/itscherryza?s=21" />
              <SocialIcon icon={<Instagram size={24} />} href="https://www.instagram.com/itscherry.za/" />
              <SocialIcon icon={<Linkedin size={24} />} href="https://www.linkedin.com/company/cherryrsa/" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Educational Card Component
const EducationalCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-left"
  >
    <div className="flex items-start gap-4 mb-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF69B4' }}>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-black mb-2">{title}</h3>
      </div>
    </div>
    <p className="text-gray-800 text-lg">{description}</p>
  </motion.div>
);

// FounderCard Component
const FounderCard = ({ name, imageSrc, offsetY = 0 }: { name: string; imageSrc: string; offsetY?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-purple-200 rounded-3xl p-8 border-4 border-black text-center"
  >
    <div className="w-48 h-48 bg-white rounded-full mx-auto mb-6 overflow-hidden relative border-4 border-white shadow-lg">
      <div className="absolute inset-0" style={{ transform: `translateY(${offsetY}px)` }}>
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-black mb-4">{name}</h3>
    <a href="https://www.linkedin.com/company/cherryrsa/" target="_blank" rel="noopener noreferrer" className="inline-block bg-pink-500 w-12 h-12 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors mx-auto">
      <Linkedin size={24} className="text-white" />
    </a>
  </motion.div>
);

// Social Icon Component
const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors text-white">
    {icon}
  </a>
);
