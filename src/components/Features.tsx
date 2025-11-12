import React from 'react';
import { 
  FileText, 
  Presentation, 
  Workflow, 
  Download, 
  TrendingUp, 
  Wand2 
} from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: '자동 콘텐츠 생성',
    description: '브리프 입력만으로 커리큘럼, 교안, 슬라이드, 실습 템플릿을 자동 생성합니다.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: FileText,
    title: '스마트 커리큘럼',
    description: '학습 목표, 성과물, 주차별 구성을 포함한 체계적인 커리큘럼을 60초 내에 제안합니다.',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Presentation,
    title: '슬라이드 자동 변환',
    description: '교안을 시각적인 슬라이드로 120초 내 자동 변환. 표지부터 요약까지 완벽 구성.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Workflow,
    title: '협업 워크플로우',
    description: '초안-리뷰-승인-배포 단계를 체계적으로 관리하고 팀원과 협업할 수 있습니다.',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    icon: Download,
    title: '다양한 배포 형식',
    description: 'PDF, PPTX, 프린트팩, 모바일 가이드 등 다양한 형식으로 즉시 배포 가능합니다.',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    icon: TrendingUp,
    title: '데이터 기반 개선',
    description: '설문 및 과제 데이터를 분석해 개선 티켓을 자동 생성하고 다음 버전에 반영합니다.',
    color: 'bg-cyan-100 text-cyan-600'
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">
            교육 콘텐츠 제작의 모든 것을 한 곳에서
          </h2>
          <p className="text-xl text-gray-600">
            브리프 작성부터 배포까지, 오토파일럿이 교육 콘텐츠 제작의 전 과정을 자동화합니다.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
