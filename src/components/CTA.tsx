import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const benefits = [
  '신용카드 등록 불필요',
  '무료 체험 기간 제공',
  '언제든지 취소 가능',
  '24/7 고객 지원'
];

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <h2 className="text-4xl lg:text-5xl text-white mb-6">
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                교육 콘텐츠 제작의 혁신을 경험해보세요. 
                첫 커리큘럼 생성까지 단 60초면 충분합니다.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                    <span className="text-white">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  무료로 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  영업팀 문의하기
                </Button>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1610210752267-525f2160a313?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJyaWN1bHVtJTIwcGxhbm5pbmd8ZW58MXx8fHwxNzYyOTQ5NzkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="시작하기"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-transparent opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
