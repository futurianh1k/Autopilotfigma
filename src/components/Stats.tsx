import React from 'react';
import { Clock, Zap, Users, Award } from 'lucide-react';

const stats = [
  {
    icon: Clock,
    value: '95%',
    label: '제작 시간 단축',
    description: '평균 3일 걸리던 작업을 2시간으로'
  },
  {
    icon: Zap,
    value: '60초',
    label: '커리큘럼 생성',
    description: '브리프 입력 후 즉시 생성'
  },
  {
    icon: Users,
    value: '1,000+',
    label: '활성 사용자',
    description: '교육 기획자와 강사들의 선택'
  },
  {
    icon: Award,
    value: '99.5%',
    label: '만족도',
    description: '사용자 평가 기준'
  }
];

export function Stats() {
  return (
    <section id="stats" className="py-24 bg-blue-600">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl text-white mb-6">
            숫자로 보는 오토파일럿
          </h2>
          <p className="text-xl text-blue-100">
            교육 콘텐츠 제작의 새로운 기준을 만들어가고 있습니다.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-xl text-white mb-2">
                  {stat.label}
                </div>
                <p className="text-blue-100">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
