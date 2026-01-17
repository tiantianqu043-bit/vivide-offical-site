import { Component, ChangeDetectionStrategy, signal, computed, effect, ElementRef, ViewChildren, ViewChild, QueryList, inject, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Role {
  id: string;
  icon: string;
  title: string;
  desc: string;
  detail: string;
}

interface TimelineStep {
  id: number;
  emoji: string;
  title: string;
  description: string;
}

interface Scenario {
  label: string;
  image: string;
  top: string;
  left: string;
  size: number; // px
  delay: string; // animation delay
  duration: string; // animation duration
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styles: [`
    :host { 
      display: block; 
      overflow-x: hidden; 
      background-color: #0a0a0a; 
      color: white; 
      font-family: 'Inter', 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Utility & Animations */
    .glass-nav { 
      background: rgba(0, 0, 0, 0.7); 
      backdrop-filter: blur(12px); 
      -webkit-backdrop-filter: blur(12px); 
      border-bottom: 1px solid rgba(255,255,255,0.05); 
    }

    /* Text Balance for avoiding widows */
    .text-balance {
      text-wrap: balance;
      white-space: normal;
    }
    
    .nav-link {
      position: relative;
      transition: color 0.3s ease;
    }
    .nav-link:hover { color: #38ef7d; }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1px;
      background: #38ef7d;
      transition: width 0.3s ease;
    }
    .nav-link:hover::after { width: 100%; }

    .nav-cta {
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }
    .nav-cta:hover {
      box-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .text-gradient { background: linear-gradient(135deg, #11998e, #38ef7d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .bg-gradient-brand { background: linear-gradient(135deg, #11998e, #38ef7d); }
    
    .bg-grid-pattern {
      background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow { animation: spin-slow 60s linear infinite; }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #333; }
    
    /* HERO SECTION OPTIMIZATIONS */
    .hero-section {
      background: 
        radial-gradient(circle at 50% 50%, rgba(17, 41, 152, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(56, 231, 125, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 20% 80%, rgba(56, 231, 125, 0.08) 0%, transparent 40%),
        #0a0a0a;
      position: relative;
      overflow: hidden;
    }

    .hero-grid::before {
      content: '';
      position: absolute;
      inset: -100%;
      background-image: 
        linear-gradient(rgba(17, 41, 152, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(17, 41, 152, 0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridMove 20s linear infinite;
      z-index: 0;
    }

    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    .hero-logo {
      position: relative;
      display: inline-block;
      animation: logoGlow 3s ease-in-out infinite, logoFloat 4s ease-in-out infinite;
    }

    .hero-logo::after {
      content: '';
      position: absolute;
      inset: -20px;
      background: radial-gradient(circle, rgba(17, 41, 152, 0.4) 0%, transparent 70%);
      filter: blur(30px);
      z-index: -1;
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes logoGlow {
      0%, 100% { filter: drop-shadow(0 0 20px rgba(17, 41, 152, 0.6)); }
      50% { filter: drop-shadow(0 0 40px rgba(56, 231, 125, 0.8)); }
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    .hero-title-highlight {
      background: linear-gradient(135deg, #112998 0%, #38e77d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      font-weight: 700;
      position: relative;
      display: inline-block;
    }

    .hero-title-highlight::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      top: 0;
      z-index: -1;
      background: linear-gradient(135deg, #112998 0%, #38e77d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: blur(20px);
      opacity: 0.5;
    }

    .hero-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn-primary {
      padding: 1rem 2.5rem;
      background: linear-gradient(135deg, #112998 0%, #38e77d 100%);
      color: #ffffff;
      border: none;
      border-radius: 50px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(17, 41, 152, 0.3);
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(17, 41, 152, 0.5);
    }

    .btn-primary:hover::before {
      opacity: 1;
    }

    .btn-primary .arrow {
      display: inline-block;
      margin-left: 0.5rem;
      transition: transform 0.3s ease;
    }

    .btn-primary:hover .arrow {
      transform: translateX(5px);
    }

    .btn-secondary {
      padding: 1rem 2.5rem;
      background: transparent;
      color: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(17, 41, 152, 0.5);
      border-radius: 50px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      z-index: 1;
    }

    .btn-secondary::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #112998 0%, #38e77d 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .btn-secondary:hover {
      border-color: #38e77d;
      color: #ffffff;
    }

    .btn-secondary:hover::before {
      opacity: 1;
    }

    .scroll-indicator {
      position: absolute;
      bottom: 3rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s ease;
    }

    .scroll-indicator:hover {
      opacity: 1;
    }

    .scroll-text {
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      color: rgba(255, 255, 255, 0.5);
    }

    .scroll-mouse {
      width: 24px;
      height: 40px;
      border: 2px solid rgba(17, 41, 152, 0.5);
      border-radius: 12px;
      position: relative;
    }

    .scroll-mouse::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 8px;
      background: linear-gradient(135deg, #112998 0%, #38e77d 100%);
      border-radius: 2px;
      animation: scrollWheel 2s ease-in-out infinite;
    }

    @keyframes scrollWheel {
      0% { top: 8px; opacity: 1; }
      100% { top: 24px; opacity: 0; }
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, rgba(56, 231, 125, 0.8) 0%, transparent 70%);
      border-radius: 50%;
      animation: floatParticle 10s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes floatParticle {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.6; }
      50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
      90% { opacity: 0.6; }
    }

    /* SECTION 2: Pain Points - Glassmorphism Styles */
    
    .pain-section {
      background: 
        radial-gradient(circle at 50% 40%, rgba(17, 41, 152, 0.12) 0%, transparent 60%),
        radial-gradient(circle at 10% 20%, rgba(56, 231, 125, 0.06) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(56, 231, 125, 0.06) 0%, transparent 40%),
        #0a0a0a;
      position: relative;
      overflow: hidden;
    }

    .pain-card {
      /* Advanced Liquid Glass Base */
      background: linear-gradient(165deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(255, 255, 255, 0.02) 100%);
      backdrop-filter: blur(30px) saturate(120%);
      -webkit-backdrop-filter: blur(30px) saturate(120%);
      
      /* Sculpted Borders for 3D Feel */
      border-top: 1px solid rgba(255, 255, 255, 0.45);
      border-left: 1px solid rgba(255, 255, 255, 0.25);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      
      /* Layered Shadows for Liquid Thickness & Depth */
      box-shadow: 
        /* Inner Rim Light (Sharp) */
        inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 
        /* Inner Volume Glow (Soft) */
        inset 0 0 20px 0 rgba(255, 255, 255, 0.03),
        /* External Drop Shadow */
        0 20px 40px -10px rgba(0, 0, 0, 0.6);
      
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy spring feel */
      animation: floatCard 6s ease-in-out infinite;
      position: relative;
      overflow: hidden;
    }
    
    /* Glossy Sheen Effect */
    .pain-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -50%;
      width: 200%;
      height: 100%;
      background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 50%);
      transform: rotate(-15deg);
      pointer-events: none;
      opacity: 0.5;
    }

    @keyframes floatCard {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }

    .pain-card:hover {
      transform: translateY(-20px) scale(1.03);
      
      /* Brighter, clearer glass on hover */
      background: linear-gradient(165deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.02) 60%, rgba(255, 255, 255, 0.05) 100%);
      border-color: rgba(56, 239, 125, 0.5);
      border-top-color: rgba(56, 239, 125, 0.8);
      
      /* Intense Glow */
      box-shadow: 
        inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 
        inset 0 0 30px 0 rgba(56, 239, 125, 0.1),
        0 30px 60px -15px rgba(0, 0, 0, 0.8),
        0 0 30px -5px rgba(56, 239, 125, 0.2); /* Colored ambient glow */
        
      animation-play-state: paused;
    }

    .pain-icon-wrapper {
      /* Liquid Bubble for Icon */
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 
        inset 0 2px 5px rgba(255,255,255,0.1),
        0 10px 20px rgba(0,0,0,0.2);
      transition: all 0.4s ease;
    }

    .pain-card:hover .pain-icon-wrapper {
      background: linear-gradient(135deg, rgba(17, 153, 142, 0.3), rgba(56, 239, 125, 0.15));
      border-color: rgba(56, 239, 125, 0.5);
      box-shadow: 
        inset 0 0 15px rgba(56, 239, 125, 0.3),
        0 0 20px rgba(56, 239, 125, 0.4);
      transform: scale(1.15) rotate(5deg);
    }

    .pain-card:hover .icon-path {
      stroke: #38ef7d;
      stroke-width: 2.5;
      filter: drop-shadow(0 0 8px rgba(56, 239, 125, 0.8));
    }

    /* Staggered animation delays */
    .delay-0 { animation-delay: 0s; }
    .delay-1000 { animation-delay: 1.5s; }
    .delay-2000 { animation-delay: 3s; }

    /* SECTION 4: Comparison Slider Refinements */
    .slider-handle-line {
      background: linear-gradient(to bottom, transparent, #fff, transparent);
    }

    .vivide-text-grad {
      background: linear-gradient(90deg, #3EE08F, #2BB673);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 15px rgba(56, 239, 125, 0.2));
    }

    .slider-glow-shadow {
      box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    }

    .mesh-blob-1 {
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(60,60,60,0.15) 0%, transparent 70%);
      filter: blur(50px);
      z-index: 0;
      top: -20%;
      left: -10%;
    }
    
    .mesh-blob-2 {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(17, 153, 142, 0.1) 0%, transparent 70%);
      filter: blur(60px);
      z-index: 0;
      bottom: -30%;
      right: -10%;
    }

    .glow-check {
      filter: drop-shadow(0 0 8px rgba(62, 224, 143, 0.4));
    }

    @keyframes handle-nudge {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(3px); }
      75% { transform: translateX(-3px); }
    }
    
    .animate-handle-hint {
      animation: handle-nudge 2s ease-in-out infinite;
      animation-delay: 2s;
    }

    /* SECTION 5: Typography & Atmosphere Refinements */
    
    /* Background Globs */
    .background-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(62,224,143,0.15) 0%, transparent 70%);
      filter: blur(100px);
      z-index: -1;
      pointer-events: none;
    }
    .left-glow { top: -20%; left: -10%; opacity: 0.8; }
    .right-glow { bottom: -10%; right: -10%; opacity: 0.6; }

    /* New Modern Typography for Section 5 */
    .text-main-modern {
      font-weight: 800;
      background: linear-gradient(90deg, #3EE08F 0%, #BFFFDF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.0;
      display: inline-block;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .text-main-modern:hover {
      transform: scale(1.02) skewX(-2deg);
      text-shadow: 0 0 30px rgba(62, 224, 143, 0.3);
    }
    
    .text-sub-modern {
      font-weight: 300;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .serif-italic {
      font-family: 'Times New Roman', serif;
      font-style: italic;
      font-weight: 400;
      letter-spacing: 0.05em;
      color: #fff;
    }

    /* Flow SVG Line */
    .flow-line {
      fill: none;
      stroke: #38ef7d;
      stroke-width: 2;
      stroke-dasharray: 8 8; /* Dotted line */
      animation: flow 30s linear infinite;
      opacity: 0.6;
      filter: drop-shadow(0 0 5px #38ef7d);
    }

    @keyframes flow {
      to { stroke-dashoffset: -200; }
    }

    .connector-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
      overflow: visible;
    }

    /* Glass Cards */
    .glass-card {
      background: rgba(17, 17, 17, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
    
    .glass-card:hover {
      border-color: rgba(62, 224, 143, 0.3);
      background: rgba(17, 17, 17, 0.6);
      transform: translateY(-5px);
    }
    
    /* SECTION 6: Scattered Bubbles Layout */
    .scenario-item {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      animation: bubble-float ease-in-out infinite;
      z-index: 10;
      transition: z-index 0s 0.3s; /* Delay z-index reset */
    }

    .scenario-item:hover {
      z-index: 20; /* Bring to front on hover */
      transition: z-index 0s;
    }

    /* The Round Bubble */
    .scenario-bubble {
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      
      /* Glassy Sphere Effect */
      box-shadow: 
        inset 0 0 20px rgba(255, 255, 255, 0.2), 
        inset -10px -10px 20px rgba(0,0,0,0.5),
        0 10px 20px rgba(0,0,0,0.3);
      
      /* Default State: Dark & Dimmed (Darker than before, no heavy gray) */
      filter: brightness(0.5) saturate(0.5);
      opacity: 0.8;
      
      transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* Text Label below bubble */
    .scenario-label {
      margin-top: 1rem;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      
      /* Default State: Grayed out */
      color: #666;
      text-shadow: none;
      
      transition: all 0.4s ease;
      background: rgba(0,0,0,0.6); /* Legibility backing */
      padding: 0.2rem 0.8rem;
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }

    /* Hover Interaction: Light Up */
    .scenario-item:hover .scenario-bubble {
      filter: brightness(1.2) saturate(1.1); /* Light up */
      opacity: 1;
      transform: scale(1.1);
      border-color: rgba(255,255,255,0.5);
      box-shadow: 
        inset 0 0 30px rgba(255, 255, 255, 0.4), 
        0 20px 40px rgba(0,0,0,0.5);
    }

    .scenario-item:hover .scenario-label {
      color: #fff;
      background: rgba(0,0,0,0.8);
      transform: translateY(5px);
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
    }

    @keyframes bubble-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()'
  }
})
export class AppComponent implements AfterViewInit, OnDestroy {
  platformId = inject(PLATFORM_ID);
  
  // Expose Math to template
  protected readonly Math = Math;

  // -- State --
  scrolled = signal(false);
  visibleComparison = signal(false); // For Section 4 Animation
  sliderWidth = signal(0); // For masking logic
  visibleCallToAction = signal(false);
  
  // Section 3: Roles
  activeRoleIndex = signal(0);
  roles: Role[] = [
    { 
      id: 'miner', 
      icon: '🔍', 
      title: '知识挖掘师', 
      desc: '深度挖掘你的隐性价值', 
      detail: 'Vivide 像矿工一样，通过深度对话挖掘你潜意识中被忽略的独特观点与经验素材。' 
    },
    { 
      id: 'proxy', 
      icon: '👥', 
      title: '观众代言人', 
      desc: '时刻代表观众视角的反馈', 
      detail: '模拟目标受众的视角与提问，在创作过程中即时反馈，确保内容产生共鸣。' 
    },
    { 
      id: 'coach', 
      icon: '🎓', 
      title: '内容教练', 
      desc: '构建逻辑严密的叙事结构', 
      detail: '提供专业的叙事结构建议，帮助你将碎片化的想法整理成逻辑严密的视频脚本。' 
    },
    { 
      id: 'partner', 
      icon: '✂️', 
      title: '剪辑搭档', 
      desc: '懂你节奏的智能剪辑', 
      detail: '不只是工具，而是并肩作战的伙伴，处理繁琐的剪辑工作，让你专注于创意。' 
    },
    { 
      id: 'companion', 
      icon: '🌱', 
      title: '成长陪伴者', 
      desc: '见证并记录你的每一次进阶', 
      detail: '记录你的创作历程，随着你的成长不断进化，越来越懂你的风格。' 
    }
  ];

  // Section 5: Timeline Steps
  timelineSteps: TimelineStep[] = [
    {
      id: 1,
      emoji: '🧠',
      title: '深度对话挖掘',
      description: 'AI追问链接真实自我价值，洞察分析输出个性化选题'
    },
    {
      id: 2,
      emoji: '⚡',
      title: '极速录制渲染',
      description: '让知识输出的工作流快到极致，节省录制耗时'
    },
    {
      id: 3,
      emoji: '✂️',
      title: '智能闪电剪辑',
      description: 'AI一键去口水词，接管枯燥、重复性，降低工程心理成本'
    },
    {
      id: 4,
      emoji: '🌱',
      title: '长期陪伴输出',
      description: '用得越久，AI 越懂你。这不是一次性工具，是长期的创作伙伴关系。'
    }
  ];
  
  getRolePos(index: number) {
    const total = this.roles.length;
    // Start from -90deg (top)
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    // Radius in percentage of container (e.g. 40%)
    const radius = 40; 
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  }

  // Section 4: Slider
  sliderValue = signal(50);
  isDragging = signal(false);

  // Section 5: Timeline
  visibleSteps = signal<Set<number>>(new Set());

  // Section 6: Scenarios
  // Layout logic: Irregular scattered positions (Top %, Left %) - SAFE ZONE
  scenarios: Scenario[] = [
    { 
      label: '知识分享', 
      image: 'https://picsum.photos/id/42/300/300', 
      top: '10%', left: '15%', size: 160, delay: '0s', duration: '6s' 
    },
    { 
      label: '技能教学', 
      image: 'https://picsum.photos/id/20/300/300', 
      top: '8%', left: '45%', size: 140, delay: '2s', duration: '7s' 
    },
    { 
      label: '行业解读', 
      image: 'https://picsum.photos/id/26/300/300', 
      top: '12%', left: '72%', size: 150, delay: '1s', duration: '8s' 
    },
    { 
      label: '个人成长', 
      image: 'https://picsum.photos/id/48/300/300', 
      top: '35%', left: '8%', size: 130, delay: '3s', duration: '5s' 
    },
    { 
      label: '经验复盘', 
      image: 'https://picsum.photos/id/56/300/300', 
      top: '40%', left: '30%', size: 170, delay: '0.5s', duration: '6.5s' 
    },
    { 
      label: '职场技能', 
      image: 'https://picsum.photos/id/60/300/300', 
      top: '32%', left: '60%', size: 140, delay: '2.5s', duration: '7.5s' 
    },
    { 
      label: '学术科普', 
      image: 'https://picsum.photos/id/119/300/300', 
      top: '45%', left: '80%', size: 150, delay: '1.5s', duration: '6s' 
    },
    { 
      label: '工具测评', 
      image: 'https://picsum.photos/id/160/300/300', 
      top: '65%', left: '15%', size: 135, delay: '4s', duration: '8s' 
    },
    { 
      label: '创业分享', 
      image: 'https://picsum.photos/id/180/300/300', 
      top: '70%', left: '45%', size: 160, delay: '0.8s', duration: '5.5s' 
    },
    { 
      label: '读书笔记', 
      image: 'https://picsum.photos/id/201/300/300', 
      top: '60%', left: '75%', size: 145, delay: '3.2s', duration: '7s' 
    },
    { 
      label: '生活感悟', 
      image: 'https://picsum.photos/id/250/300/300', 
      top: '80%', left: '25%', size: 125, delay: '1.2s', duration: '6.2s' 
    },
    { 
      label: '美学鉴赏', 
      image: 'https://picsum.photos/id/319/300/300', 
      top: '75%', left: '65%', size: 155, delay: '2.8s', duration: '7.8s' 
    },
  ];

  private intervalId: any;
  private resizeObserver: ResizeObserver | null = null;

  @ViewChildren('timelineStep') timelineElements!: QueryList<ElementRef>;
  @ViewChild('comparisonSection') comparisonSection!: ElementRef;
  @ViewChild('ctaSection') ctaSection!: ElementRef;
  @ViewChildren('sliderContainer') sliderContainer!: QueryList<ElementRef>;

  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled.set(window.scrollY > 20);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Auto rotate roles
      this.startRoleRotation();

      // Intersection Observer for Timeline & Comparison
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Timeline Steps
            if (entry.target.hasAttribute('data-index')) {
              const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
              this.visibleSteps.update(set => {
                const newSet = new Set(set);
                newSet.add(index);
                return newSet;
              });
            }
            // Comparison Section
            if (entry.target === this.comparisonSection?.nativeElement) {
              this.visibleComparison.set(true);
            }
             // Call to Action
            if (entry.target === this.ctaSection?.nativeElement) {
              this.visibleCallToAction.set(true);
            }
          }
        });
      }, { threshold: 0.25 });

      this.timelineElements.forEach(el => observer.observe(el.nativeElement));
      if (this.comparisonSection) observer.observe(this.comparisonSection.nativeElement);
      if (this.ctaSection) observer.observe(this.ctaSection.nativeElement);

      // Resize Observer for Slider Width Fix
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
           this.sliderWidth.set(entry.contentRect.width);
        }
      });
      if (this.sliderContainer.first) {
        this.resizeObserver.observe(this.sliderContainer.first.nativeElement);
      }
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  // Role Logic
  setActiveRole(index: number) {
    this.activeRoleIndex.set(index);
    this.resetRoleRotation();
  }

  startRoleRotation() {
    this.intervalId = setInterval(() => {
      this.activeRoleIndex.update(i => (i + 1) % this.roles.length);
    }, 5000);
  }

  resetRoleRotation() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.startRoleRotation();
  }

  // Slider Logic
  updateSlider(event: MouseEvent | TouchEvent, container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    let clientX = (event as MouseEvent).clientX;
    if ((event as TouchEvent).touches && (event as TouchEvent).touches.length > 0) {
      clientX = (event as TouchEvent).touches[0].clientX;
    }
    
    let percentage = ((clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    this.sliderValue.set(percentage);
  }

  onDragStart(event: MouseEvent | TouchEvent, container: HTMLElement) {
    this.isDragging.set(true);
    // Prevent default drag behavior
    if (event.type === 'touchstart') event.preventDefault(); 
    this.updateSlider(event, container);
  }
  
  onDragMove(event: MouseEvent | TouchEvent) {
    if (this.isDragging() && this.sliderContainer.first) {
      this.updateSlider(event, this.sliderContainer.first.nativeElement);
    }
  }

  onDragEnd() {
    this.isDragging.set(false);
  }
}