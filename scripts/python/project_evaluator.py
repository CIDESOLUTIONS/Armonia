#!/usr/bin/env python3
"""
Script de Evaluación Especializada para Proyecto Armonía
Evaluación profunda basada en especificaciones técnicas v15
Sistema de Administración de Conjuntos Residenciales
"""

import os
import json
import hashlib
import subprocess
import sys
from datetime import datetime
from pathlib import Path
import re
from typing import Dict, List, Any

class ArmoniaProjectEvaluator:
    def __init__(self, project_path="."):
        self.project_path = Path(project_path)
        self.evaluation_data = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "project_path": str(self.project_path.absolute()),
                "evaluator_version": "2.0.0-armonia-specialized",
                "specifications_version": "v15"
            },
            "compliance_analysis": {},
            "architecture_evaluation": {},
            "technology_stack_compliance": {},
            "feature_implementation_status": {},
            "ui_ux_evaluation": {},
            "security_compliance": {},
            "performance_analysis": {},
            "deployment_readiness": {},
            "business_model_implementation": {},
            "code_quality_armonia": {},
            "missing_requirements": {},
            "recommendations": {}
        }
        
        # Especificaciones técnicas de Armonía
        self.required_tech_stack = {
            "frontend": {
                "nextjs": "15.3.3",
                "react": "19.1",
                "typescript": True,
                "tailwind": True,
                "shadcn": True
            },
            "backend": {
                "nextjs_api": True,
                "serverless": True
            },
            "database": {
                "postgresql": "17.5",
                "multi_tenant": True,
                "prisma": "6.5.0"
            },
            "auth": {
                "jwt": True,
                "bcrypt": True
            },
            "additional": {
                "zod": True,
                "recharts": True,
                "pdfkit": True,
                "playwright": True
            }
        }
        
        self.required_features = {
            "landing_page": ["seo_optimization", "pricing_plans", "registration_form", "blog", "testimonials"],
            "authentication": ["multi_role", "jwt", "password_recovery", "session_management", "login_history"],
            "admin_panel": ["dashboard", "kpis", "inventory_management", "assemblies", "financial_management", "pqr_system"],
            "resident_panel": ["personal_dashboard", "payment_status", "service_reservations", "assembly_participation", "pqr_creation"],
            "reception_panel": ["visitor_management", "correspondence_control", "virtual_intercom", "incident_reports", "digital_minutes"],
            "app_admin_panel": ["tenant_management", "revenue_tracking", "usage_monitoring", "license_management"],
            "multi_tenant": ["schema_based", "data_isolation", "export_import"],
            "freemium_model": ["basic_plan", "standard_plan", "premium_plan", "usage_limits"]
        }
    
    def analyze_project_structure_armonia(self):
        """Analiza la estructura específica para Armonía"""
        structure_analysis = {
            "src_structure": {},
            "portal_structure": {},
            "compliance_score": 0,
            "missing_directories": [],
            "extra_directories": []
        }
        
        expected_structure = {
            "src/app": {
                "(admin)": ["page.tsx", "dashboard/", "inventory/", "assemblies/", "financial/", "pqr/"],
                "(resident)": ["page.tsx", "dashboard/", "payments/", "reservations/", "assemblies/", "pqr/"],
                "(reception)": ["page.tsx", "dashboard/", "visitors/", "packages/", "incidents/"],
                "(public)": ["page.tsx", "landing/", "blog/", "testimonials/"],
                "(auth)": ["login/", "register/", "forgot-password/"]
            },
            "src/components": {
                "ui/": ["shadcn components"],
                "charts/": ["recharts components"],
                "forms/": ["form components"],
                "layout/": ["layout components"]
            },
            "src/lib": ["auth.ts", "db.ts", "utils.ts", "validations.ts"],
            "prisma": ["schema.prisma", "migrations/"],
            "docs": ["README.md", "API.md", "DEPLOYMENT.md"]
        }
        
        # Analizar estructura actual vs esperada
        for expected_path, expected_content in expected_structure.items():
            actual_path = self.project_path / expected_path
            if actual_path.exists():
                structure_analysis["src_structure"][expected_path] = {
                    "exists": True,
                    "type": "directory" if actual_path.is_dir() else "file",
                    "content": self._analyze_directory_content(actual_path, expected_content)
                }
            else:
                structure_analysis["missing_directories"].append(expected_path)
        
        self.evaluation_data["architecture_evaluation"]["structure"] = structure_analysis
    
    def _analyze_directory_content(self, path: Path, expected_content: List[str]) -> Dict:
        """Analiza el contenido de un directorio"""
        if not path.is_dir():
            return {"error": "Not a directory"}
        
        actual_items = [item.name for item in path.iterdir()]
        
        return {
            "expected_items": expected_content,
            "actual_items": actual_items,
            "missing_items": [item for item in expected_content if item not in actual_items],
            "extra_items": [item for item in actual_items if item not in expected_content]
        }
    
    def analyze_technology_stack_compliance(self):
        """Evalúa cumplimiento del stack tecnológico"""
        compliance = {
            "package_json_analysis": {},
            "typescript_usage": False,
            "next_js_version": None,
            "react_version": None,
            "database_config": {},
            "auth_implementation": {},
            "compliance_score": 0,
            "missing_technologies": []
        }
        
        # Analizar package.json
        package_json = self.project_path / 'package.json'
        if package_json.exists():
            try:
                content = json.loads(package_json.read_text())
                deps = {**content.get("dependencies", {}), **content.get("devDependencies", {})}
                
                # Verificar tecnologías requeridas
                tech_checks = {
                    "next": ("next", "15.3.3"),
                    "react": ("react", "19.1"),
                    "typescript": ("typescript", None),
                    "tailwindcss": ("tailwindcss", None),
                    "prisma": ("prisma", "6.5.0"),
                    "zod": ("zod", None),
                    "recharts": ("recharts", None),
                    "bcrypt": ("bcrypt", None),
                    "jsonwebtoken": ("jsonwebtoken", None)
                }
                
                for tech, (package_name, min_version) in tech_checks.items():
                    if package_name in deps:
                        compliance["package_json_analysis"][tech] = {
                            "installed": True,
                            "version": deps[package_name],
                            "meets_requirement": True if not min_version else self._compare_versions(deps[package_name], min_version)
                        }
                    else:
                        compliance["missing_technologies"].append(tech)
                        compliance["package_json_analysis"][tech] = {"installed": False}
                
            except Exception as e:
                compliance["package_json_analysis"]["error"] = str(e)
        
        # Verificar TypeScript
        tsconfig = self.project_path / 'tsconfig.json'
        compliance["typescript_usage"] = tsconfig.exists()
        
        # Verificar configuración de Prisma
        prisma_schema = self.project_path / 'prisma' / 'schema.prisma'
        if prisma_schema.exists():
            try:
                schema_content = prisma_schema.read_text()
                compliance["database_config"] = {
                    "prisma_schema_exists": True,
                    "postgresql_configured": "postgresql" in schema_content.lower(),
                    "multi_tenant_ready": "schema" in schema_content.lower(),
                    "schema_content": schema_content[:2000]  # Primeros 2000 caracteres
                }
            except Exception as e:
                compliance["database_config"]["error"] = str(e)
        
        self.evaluation_data["technology_stack_compliance"] = compliance
    
    def analyze_feature_implementation_status(self):
        """Analiza el estado de implementación de funcionalidades"""
        feature_status = {}
        
        for feature_category, features in self.required_features.items():
            feature_status[feature_category] = {
                "implemented": [],
                "partially_implemented": [],
                "not_implemented": [],
                "score": 0
            }
            
            for feature in features:
                implementation_status = self._check_feature_implementation(feature_category, feature)
                if implementation_status == "implemented":
                    feature_status[feature_category]["implemented"].append(feature)
                elif implementation_status == "partial":
                    feature_status[feature_category]["partially_implemented"].append(feature)
                else:
                    feature_status[feature_category]["not_implemented"].append(feature)
            
            # Calcular score
            total_features = len(features)
            implemented_count = len(feature_status[feature_category]["implemented"])
            partial_count = len(feature_status[feature_category]["partially_implemented"])
            feature_status[feature_category]["score"] = (implemented_count + partial_count * 0.5) / total_features * 100
        
        self.evaluation_data["feature_implementation_status"] = feature_status
    
    def _check_feature_implementation(self, category: str, feature: str) -> str:
        """Verifica si una funcionalidad está implementada"""
        # Patrones de búsqueda por categoría y feature
        search_patterns = {
            "landing_page": {
                "seo_optimization": ["metadata", "head", "seo"],
                "pricing_plans": ["pricing", "plans", "freemium"],
                "registration_form": ["register", "signup", "form"],
                "blog": ["blog", "articles", "posts"],
                "testimonials": ["testimonials", "reviews", "feedback"]
            },
            "authentication": {
                "multi_role": ["role", "admin", "resident", "reception"],
                "jwt": ["jwt", "token", "auth"],
                "password_recovery": ["forgot", "reset", "recovery"],
                "session_management": ["session", "logout", "expire"],
                "login_history": ["login", "history", "log"]
            },
            "admin_panel": {
                "dashboard": ["dashboard", "admin"],
                "kpis": ["kpi", "metrics", "statistics"],
                "inventory_management": ["inventory", "properties", "residents"],
                "assemblies": ["assembly", "meeting", "voting"],
                "financial_management": ["financial", "payment", "invoice"],
                "pqr_system": ["pqr", "complaints", "requests"]
            }
        }
        
        if category in search_patterns and feature in search_patterns[category]:
            patterns = search_patterns[category][feature]
            return self._search_patterns_in_codebase(patterns)
        
        return "not_implemented"
    
    def _search_patterns_in_codebase(self, patterns: List[str]) -> str:
        """Busca patrones en el código fuente"""
        found_patterns = 0
        code_files = list(self.project_path.rglob('*.ts')) + list(self.project_path.rglob('*.tsx'))
        
        for file_path in code_files:
            if any(ignore in str(file_path) for ignore in ['node_modules', '.git', 'dist', 'build']):
                continue
            
            try:
                content = file_path.read_text(encoding='utf-8', errors='ignore').lower()
                for pattern in patterns:
                    if pattern.lower() in content:
                        found_patterns += 1
                        break
            except Exception:
                continue
        
        if found_patterns >= len(patterns) * 0.8:
            return "implemented"
        elif found_patterns > 0:
            return "partial"
        else:
            return "not_implemented"
    
    def analyze_ui_ux_compliance(self):
        """Analiza cumplimiento de diseño UI/UX"""
        ui_analysis = {
            "tailwind_usage": False,
            "shadcn_components": False,
            "responsive_design": False,
            "dark_mode_support": False,
            "accessibility_features": False,
            "component_structure": {},
            "design_system_compliance": 0
        }
        
        # Verificar uso de Tailwind
        tailwind_config = self.project_path / 'tailwind.config.js'
        if tailwind_config.exists() or (self.project_path / 'tailwind.config.ts').exists():
            ui_analysis["tailwind_usage"] = True
        
        # Verificar componentes Shadcn
        components_ui = self.project_path / 'src' / 'components' / 'ui'
        if components_ui.exists():
            ui_analysis["shadcn_components"] = True
            ui_analysis["component_structure"] = {
                "ui_components": [f.name for f in components_ui.iterdir() if f.is_file()]
            }
        
        # Buscar patrones de responsive design
        css_files = list(self.project_path.rglob('*.css')) + list(self.project_path.rglob('*.scss'))
        tsx_files = list(self.project_path.rglob('*.tsx'))
        
        responsive_patterns = ['sm:', 'md:', 'lg:', 'xl:', '@media']
        dark_mode_patterns = ['dark:', 'theme', 'dark-mode']
        
        for file_path in css_files + tsx_files:
            try:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
                if any(pattern in content for pattern in responsive_patterns):
                    ui_analysis["responsive_design"] = True
                if any(pattern in content for pattern in dark_mode_patterns):
                    ui_analysis["dark_mode_support"] = True
            except Exception:
                continue
        
        self.evaluation_data["ui_ux_evaluation"] = ui_analysis
    
    def analyze_security_compliance(self):
        """Analiza cumplimiento de seguridad"""
        security_analysis = {
            "authentication_security": {},
            "data_protection": {},
            "input_validation": {},
            "api_security": {},
            "security_score": 0,
            "vulnerabilities": [],
            "recommendations": []
        }
        
        # Verificar autenticación segura
        auth_files = list(self.project_path.rglob('*auth*')) + list(self.project_path.rglob('*login*'))
        
        security_patterns = {
            "bcrypt_usage": ["bcrypt", "hash", "salt"],
            "jwt_implementation": ["jwt", "jsonwebtoken", "token"],
            "input_validation": ["zod", "validate", "schema"],
            "csrf_protection": ["csrf", "token", "protection"],
            "rate_limiting": ["rate", "limit", "throttle"]
        }
        
        for pattern_name, patterns in security_patterns.items():
            found = False
            for file_path in auth_files:
                if file_path.is_file():
                    try:
                        content = file_path.read_text(encoding='utf-8', errors='ignore')
                        if any(pattern in content.lower() for pattern in patterns):
                            found = True
                            break
                    except Exception:
                        continue
            security_analysis["authentication_security"][pattern_name] = found
        
        self.evaluation_data["security_compliance"] = security_analysis
    
    def analyze_business_model_implementation(self):
        """Analiza implementación del modelo de negocio Freemium"""
        business_analysis = {
            "freemium_plans": {},
            "pricing_structure": {},
            "usage_limitations": {},
            "payment_integration": {},
            "subscription_management": {},
            "implementation_score": 0
        }
        
        # Buscar implementación de planes
        plan_patterns = ["basic", "standard", "premium", "freemium", "subscription"]
        pricing_patterns = ["price", "billing", "payment", "stripe", "paypal"]
        
        for file_path in self.project_path.rglob('*.ts'):
            if file_path.is_file():
                try:
                    content = file_path.read_text(encoding='utf-8', errors='ignore').lower()
                    for pattern in plan_patterns:
                        if pattern in content:
                            business_analysis["freemium_plans"][pattern] = True
                    for pattern in pricing_patterns:
                        if pattern in content:
                            business_analysis["pricing_structure"][pattern] = True
                except Exception:
                    continue
        
        self.evaluation_data["business_model_implementation"] = business_analysis
    
    def analyze_missing_requirements(self):
        """Identifica requerimientos faltantes"""
        missing = {
            "critical_missing": [],
            "important_missing": [],
            "nice_to_have_missing": [],
            "implementation_priority": {}
        }
        
        # Categorizar requerimientos por criticidad
        critical_requirements = [
            "Next.js 15.3.3+",
            "React 19.1+",
            "PostgreSQL 17.5+",
            "Multi-tenant architecture",
            "JWT authentication",
            "Admin dashboard",
            "Resident portal",
            "Reception portal"
        ]
        
        important_requirements = [
            "Tailwind CSS",
            "Shadcn/UI",
            "Prisma ORM",
            "Landing page",
            "PQR system",
            "Assembly management",
            "Financial management"
        ]
        
        # Verificar cada requerimiento
        for requirement in critical_requirements:
            if not self._check_requirement_implementation(requirement):
                missing["critical_missing"].append(requirement)
        
        for requirement in important_requirements:
            if not self._check_requirement_implementation(requirement):
                missing["important_missing"].append(requirement)
        
        self.evaluation_data["missing_requirements"] = missing
    
    def _check_requirement_implementation(self, requirement: str) -> bool:
        """Verifica si un requerimiento específico está implementado"""
        # Simplificado - en implementación real sería más detallado
        requirement_lower = requirement.lower()
        
        # Buscar en archivos de configuración y código
        config_files = ['package.json', 'tsconfig.json', 'prisma/schema.prisma']
        
        for config_file in config_files:
            file_path = self.project_path / config_file
            if file_path.exists():
                try:
                    content = file_path.read_text().lower()
                    if any(key in content for key in requirement_lower.split()):
                        return True
                except Exception:
                    continue
        
        return False
    
    def generate_recommendations(self):
        """Genera recomendaciones específicas para Armonía"""
        recommendations = {
            "immediate_actions": [],
            "short_term_improvements": [],
            "long_term_enhancements": [],
            "architecture_suggestions": [],
            "performance_optimizations": [],
            "security_enhancements": []
        }
        
        # Basado en el análisis, generar recomendaciones
        if not self.evaluation_data["technology_stack_compliance"].get("typescript_usage", False):
            recommendations["immediate_actions"].append("Configurar TypeScript para el proyecto")
        
        if not self.evaluation_data["architecture_evaluation"].get("structure", {}).get("src_structure", {}):
            recommendations["immediate_actions"].append("Implementar estructura de carpetas según especificaciones")
        
        missing_critical = self.evaluation_data.get("missing_requirements", {}).get("critical_missing", [])
        if missing_critical:
            recommendations["immediate_actions"].extend([f"Implementar: {req}" for req in missing_critical])
        
        self.evaluation_data["recommendations"] = recommendations
    
    def _compare_versions(self, current: str, required: str) -> bool:
        """Compara versiones de manera simple"""
        try:
            current_parts = [int(x) for x in current.replace('^', '').replace('~', '').split('.')]
            required_parts = [int(x) for x in required.split('.')]
            
            for i in range(min(len(current_parts), len(required_parts))):
                if current_parts[i] > required_parts[i]:
                    return True
                elif current_parts[i] < required_parts[i]:
                    return False
            
            return len(current_parts) >= len(required_parts)
        except:
            return False
    
    def run_armonia_evaluation(self):
        """Ejecuta la evaluación completa específica para Armonía"""
        print("🏢 Iniciando evaluación especializada para Armonía...")
        print("📋 Basada en Especificaciones Técnicas v15")
        print("=" * 60)
        
        print("🏗️  Analizando arquitectura y estructura...")
        self.analyze_project_structure_armonia()
        
        print("💻 Evaluando stack tecnológico...")
        self.analyze_technology_stack_compliance()
        
        print("⚙️  Verificando implementación de funcionalidades...")
        self.analyze_feature_implementation_status()
        
        print("🎨 Analizando cumplimiento UI/UX...")
        self.analyze_ui_ux_compliance()
        
        print("🔒 Evaluando seguridad...")
        self.analyze_security_compliance()
        
        print("💰 Analizando modelo de negocio Freemium...")
        self.analyze_business_model_implementation()
        
        print("❌ Identificando requerimientos faltantes...")
        self.analyze_missing_requirements()
        
        print("💡 Generando recomendaciones...")
        self.generate_recommendations()
        
        print("✅ Evaluación especializada completada!")
        
        return self.evaluation_data
    
    def save_armonia_report(self, filename="armonia_evaluation_report.json"):
        """Guarda el reporte especializado"""
        report_path = self.project_path / filename
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.evaluation_data, f, indent=2, ensure_ascii=False)
        
        print(f"📊 Reporte especializado guardado en: {report_path}")
        return report_path
    
    def generate_summary_report(self):
        """Genera un resumen ejecutivo"""
        summary = {
            "overall_compliance": 0,
            "technology_readiness": 0,
            "feature_completeness": 0,
            "architecture_score": 0,
            "security_score": 0,
            "ui_ux_score": 0,
            "business_model_score": 0,
            "critical_issues": [],
            "next_steps": []
        }
        
        # Calcular scores generales
        tech_compliance = self.evaluation_data.get("technology_stack_compliance", {})
        feature_status = self.evaluation_data.get("feature_implementation_status", {})
        
        # Calcular compliance general
        scores = []
        for category, features in feature_status.items():
            if "score" in features:
                scores.append(features["score"])
        
        if scores:
            summary["overall_compliance"] = sum(scores) / len(scores)
        
        # Identificar problemas críticos
        missing_critical = self.evaluation_data.get("missing_requirements", {}).get("critical_missing", [])
        summary["critical_issues"] = missing_critical
        
        # Próximos pasos
        recommendations = self.evaluation_data.get("recommendations", {})
        summary["next_steps"] = recommendations.get("immediate_actions", [])
        
        return summary

def main():
    """Función principal especializada para Armonía"""
    print("🏢 EVALUADOR ESPECIALIZADO ARMONÍA v2.0")
    print("Sistema de Administración de Conjuntos Residenciales")
    print("Basado en Especificaciones Técnicas v15")
    print("=" * 60)
    
    # Determinar la ruta del proyecto
    project_path = sys.argv[1] if len(sys.argv) > 1 else "."
    
    if not os.path.exists(project_path):
        print(f"❌ Error: La ruta {project_path} no existe")
        sys.exit(1)
    
    # Crear y ejecutar el evaluador especializado
    evaluator = ArmoniaProjectEvaluator(project_path)
    evaluation_data = evaluator.run_armonia_evaluation()
    
    # Guardar reporte
    report_path = evaluator.save_armonia_report()
    
    # Generar resumen
    summary = evaluator.generate_summary_report()
    
    print("\n" + "=" * 60)
    print("📋 RESUMEN EJECUTIVO - ARMONÍA")
    print("=" * 60)
    
    print(f"🎯 Cumplimiento General: {summary['overall_compliance']:.1f}%")
    
    if summary['critical_issues']:
        print(f"🚨 Problemas Críticos: {len(summary['critical_issues'])}")
        for issue in summary['critical_issues'][:5]:  # Mostrar solo los primeros 5
            print(f"   • {issue}")
    
    if summary['next_steps']:
        print(f"📋 Próximos Pasos ({len(summary['next_steps'])}):")
        for step in summary['next_steps'][:3]:  # Mostrar solo los primeros 3
            print(f"   • {step}")
    
    print(f"\n📄 Reporte completo: {report_path}")
    print("\n🎯 Envía el archivo JSON a Claude para obtener:")
    print("   • 📊 Análisis detallado con puntuación por módulos")
    print("   • 🚀 Plan de desarrollo paso a paso")
    print("   • 💡 Recomendaciones de mejoras funcionales y visuales")
    print("   • 📐 Roadmap completo para producción")
    print("   • 🤖 Prompts específicos para equipo de desarrollo IA")
    print("\n🏢 ¡Listo para transformar la gestión residencial!")

if __name__ == "__main__":
    main()
