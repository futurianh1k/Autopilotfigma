import React from 'react';
import { 
  ClipboardList, 
  Sparkles, 
  Eye, 
  CheckCircle, 
  Send 
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const steps = [
  {
    icon: ClipboardList,
    title: '브리프 작성',
    description: '교육 대상, 목적, 기간, 제약사항 등을 간단한 설문 형식으로 입력합니다.',
    step: '01'
  },
  {
    icon: Sparkles,
    title: '자동 생성',
    description: 'AI가 60초 내에 커리큘럼, 교안, 슬라이드, 실습 템플릿을 자동으로 생성합니다.',
    step: '02'
  },
  {
    icon: Eye,
    title: '검토 및 수정',
    description: '생성된 콘텐츠를 검토하고 필요한 부분을 수정합니다. 실시간 미리보기 지원.',
    step: '03'
  },
  {
    icon: CheckCircle,
    title: '승인 프로세스',
    description: '팀원들과 협업하여 리뷰하고 최종 승인을 진행합니다.',
    step: '04'
  },
  {
    icon: Send,
    title: '배포 및 분석',
    description: '다양한 형식으로 배포하고, 피드백을 수집하여 지속적으로 개선합니다.',
    step: '05'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">
            어떻게 작동하나요?
          </h2>
          <p className="text-xl text-gray-600">
            5단계로 완성되는 교육 콘텐츠. 복잡한 과정은 오토파일럿이 처리합니다.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={index}
                  className="flex gap-6 p-6 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                        {step.step}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1762341123685-098ecb6c3ef7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbGVhcm5pbmclMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYyODUxMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="작동 방식"
                className="w-full h-auto"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20" />
          </div>
        </div>
      </div>
    </section>
  );
}
