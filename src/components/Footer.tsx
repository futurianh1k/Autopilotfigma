import React from 'react';
import { Sparkles, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  product: {
    title: '제품',
    links: ['기능', '가격', '사용 사례', 'API 문서']
  },
  company: {
    title: '회사',
    links: ['소개', '블로그', '채용', '파트너십']
  },
  resources: {
    title: '리소스',
    links: ['도움말', '가이드', '튜토리얼', '커뮤니티']
  },
  legal: {
    title: '법적 고지',
    links: ['이용약관', '개인정보처리방침', '보안', '쿠키 정책']
  }
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-blue-500" />
              <span className="text-xl text-white">오토파일럿</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI 기반 자동 교육 콘텐츠 생성 플랫폼. 
              교육 기획자와 강사를 위한 스마트한 솔루션.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">
            © 2025 오토파일럿. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              한국어
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              English
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
