import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-xl text-blue-900">오토파일럿</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">주요 기능</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">작동 방식</a>
            <a href="#stats" className="text-gray-700 hover:text-blue-600 transition-colors">성과</a>
            <Button variant="outline">로그인</Button>
            <Button>시작하기</Button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span>AI 기반 교육 콘텐츠 자동 생성</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl text-gray-900">
              교육 콘텐츠 제작,
              <br />
              <span className="text-blue-600">60초면 충분합니다</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-xl">
              간단한 브리프 입력만으로 커리큘럼부터 슬라이드, 실습 자료까지 자동 생성. 
              교육 기획자와 강사를 위한 스마트 콘텐츠 생성 플랫폼.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6">
                무료로 시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                데모 보기
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl text-gray-900">60초</div>
                <div className="text-sm text-gray-600">커리큘럼 생성</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-3xl text-gray-900">120초</div>
                <div className="text-sm text-gray-600">슬라이드 변환</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-3xl text-gray-900">99.5%</div>
                <div className="text-sm text-gray-600">시스템 가용성</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1613563696477-85af63b3b602?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB0ZWNobm9sb2d5JTIwdGVhY2hlcnxlbnwxfHx8fDE3NjI5NDk3OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="교육 콘텐츠 생성 플랫폼"
                className="w-full h-auto"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">방금 생성 완료</div>
                  <div className="text-gray-900">AI 활용 교육 과정</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-0 w-1/2 h-full opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
